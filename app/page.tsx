'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
// Typewriter effect removed for report rendering in favor of sectioned layout
// Removed separate share modal; share now generates composite and invokes OS share sheet
import ColdOpenSplash from '@/components/splash/ColdOpenSplash';
import { compressImage, fileToBase64, generateCaseNumber, isHEICFile, convertHEICToJPEG } from '@/lib/utils';
import Lightbox from '@/components/Lightbox';
import { exportCompositeImage } from '@/lib/export';
import { PRESETS, getPresetById, type PresetId } from '@/lib/presets';
import { ReportSections } from '@/components/ReportSections';
import { normalizeReport } from '@/lib/normalize';
import { useHistory } from '@/components/history/useHistory';

const MAX_SIZE_MB = 10;

// Filters removed

type Report = {
  caseId: string;
  report: string;
  shortText: string;
};

export default function Page() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragHover, setDragHover] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [presetId, setPresetId] = useState<PresetId>(() => {
    if (typeof window === 'undefined') return 'crime';
    return (localStorage.getItem('crimecam_preset') as PresetId) || 'crime';
  });
  // const [filter, setFilter] = useState<FilterKind>('none');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<'idle' | 'upload' | 'analyzing' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  // const [shareOpen, setShareOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  // const [applyToAI, setApplyToAI] = useState(false);
  const { addItem } = useHistory();

  useEffect(() => () => { if (previewURL) URL.revokeObjectURL(previewURL); }, [previewURL]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('crimecam_preset', presetId); }, [presetId]);

  // Filters removed; no style transforms

  async function onPick(file: File) {
    setError(null);
    if (!file) return;
    
    // Check if it's a HEIC file or regular image
    const isHeic = isHEICFile(file);
    if (!file.type.startsWith('image/') && !isHeic) { 
      setError('Unsupported file type. Use JPG/PNG/HEIC.'); 
      return; 
    }
    
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) { setError('Max size is 10MB.'); return; }

    let finalFile = file;
    try {
      // Convert HEIC to JPEG if needed
      if (isHeic) {
        finalFile = await convertHEICToJPEG(file);
      }
      // Then compress the image
      finalFile = await compressImage(finalFile, 1600, 0.85);
    } catch (error: any) {
      setError(error.message || 'Image processing failed.');
      return;
    }

    setImageFile(finalFile);
    const url = URL.createObjectURL(finalFile);
    setPreviewURL(url);
    setProgress('idle');
    setReport(null);
  }

  async function analyze() {
    if (!imageFile) return;
    try {
      setLoading(true); setProgress('upload');
      const base64 = await fileToBase64(imageFile);
      setProgress('analyzing');
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mode: presetId })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`Analyze failed (${res.status}): ${errorData.error || 'Unknown error'}`);
      }
      const data = await res.json();
      const caseId = generateCaseNumber();
      let report: string = data.report ?? 'Case file corrupted. Investigation inconclusive.';
      try { report = normalizeReport(report); } catch {}
      const shortText = `CASE #${caseId}\n\n${report.substring(0, 260)}...`;
      const rep: Report = { caseId, report, shortText };
      setReport(rep);
      setProgress('done');
      if (previewURL) addItem({ id: caseId, createdAt: Date.now(), thumbnail: previewURL, text: report });
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error');
      setProgress('error');
    } finally {
      setLoading(false);
    }
  }

  async function doShare() {
    if (!previewURL || !report) return;
    try {
      setExporting(true);
      const exportTitle = getPresetById(presetId).exportTitle;
      const blob = await exportCompositeImage({ src: previewURL, caseId: report.caseId, report: report.report, filter: 'none', useShortText: false, titleOverride: exportTitle });
      const file = new File([blob], `crime-scene-${report.caseId}.png`, { type: 'image/png' });
      const canShareFile = typeof navigator !== 'undefined' && 'canShare' in navigator && (navigator as any).canShare?.({ files: [file] });
      if (typeof (navigator as any).share === 'function' && canShareFile) {
        try { await (navigator as any).share({ files: [file], title: `Case #${report.caseId}`, text: 'Crime Scene Report' }); return; } catch {}
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `crime-scene-${report.caseId}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Export failed. Try again.');
    } finally {
      setExporting(false);
    }
  }

  function reset() {
    setImageFile(null); setPreviewURL(null); setReport(null); setError(null); setProgress('idle');
  }

  return (
    <ColdOpenSplash skipIfSeen={true}>
      {/* Upload / Preview */}
      {!previewURL && (
        <section className="mt-6">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <img src="/crimecam-icon.jpg" alt="CrimeCam.Fun" className="h-24 w-24 rounded-md border border-crime-border object-cover" />
              <h2 className="text-2xl font-semibold tracking-tight">Upload Evidence</h2>
            </div>
            <p className="mt-1 text-neutral-400 text-sm">Drop a photo or use your camera. We’ll generate a tongue‑in‑cheek detective report.</p>
          </div>
          <div
            className={`dropzone ${dragHover ? 'hover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragHover(true); }}
            onDragLeave={() => setDragHover(false)}
            onDrop={(e) => { e.preventDefault(); setDragHover(false); const f = e.dataTransfer.files?.[0]; if (f) onPick(f); }}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-full overflow-x-auto no-scrollbar">
                <div className="flex gap-2 pb-1">
                  {PRESETS.map(p => (
                    <button
                      key={p.id}
                      className={`px-3 py-1 rounded-full border ${presetId===p.id?'bg-yellow-300 text-black border-yellow-400':'border-crime-border text-neutral-300'} whitespace-nowrap`}
                      onClick={() => setPresetId(p.id as PresetId)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-neutral-400 text-sm">JPG/PNG/HEIC · ≤10MB</p>
              <div className="flex gap-3 mt-1">
                <button className="btn btn-ghost" onClick={() => inputRef.current?.click()}>Choose File</button>
                <label className="btn btn-primary cursor-pointer">
                  <input type="file" accept="image/*,.heic,.heif,image/heic,image/heif,image/heic-sequence,image/heif-sequence" capture="environment" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
                  Use Camera
                </label>
              </div>
              <input ref={inputRef} type="file" accept="image/*,.heic,.heif,image/heic,image/heif,image/heic-sequence,image/heif-sequence" className="hidden"
                     onChange={(e)=>{const f=e.target.files?.[0]; if (f) onPick(f);}} />
            </div>
          </div>
          {error && (
            <motion.div initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-3 text-sm text-red-400">
              {error}
            </motion.div>
          )}
        </section>
      )}

      {previewURL && !report && (
        <section className="mt-6 space-y-4">
          <div className="relative">
            <img src={previewURL} alt="Preview" className="w-full max-h-[50vh] sm:max-h-none object-contain rounded-2xl border border-crime-border shadow-crime cursor-zoom-in" onClick={() => setLightboxOpen(true)} />
          </div>

          {error && progress === 'error' && (
            <motion.div initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-3 text-sm text-red-400 p-3 rounded-lg border border-red-500/20 bg-red-500/10">
              <strong>Investigation Failed:</strong> {error}
            </motion.div>
          )}

          <div className="fixed inset-x-0 bottom-0 p-4 backdrop-blur bg-black/40 border-t border-crime-border">
            <div className="max-w-3xl mx-auto flex gap-3">
              <button disabled={loading} className="btn btn-ghost flex-1" onClick={reset}>Back</button>
              <button disabled={loading} className="btn btn-primary flex-[2]" onClick={analyze}>
                {loading ? (progress === 'upload' ? 'Uploading…' : 'Analyzing…') : 'Analyze Scene'}
              </button>
            </div>
          </div>
        </section>
      )}

      {report && (
        <section className="mt-6 pb-24">
          <div className="grid md:grid-cols-2 gap-4 items-start">
            <div className="space-y-2 md:sticky md:top-20 self-start">
              {previewURL && (
                <img
                  src={previewURL}
                  alt="Analyzed photo"
                  className="w-full max-h-[45vh] sm:max-h-none object-contain rounded-2xl border border-crime-border shadow-crime cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                />
              )}
            </div>
            <div className="card p-5 pb-32 max-h-[70vh] overflow-y-auto">
              <div className="text-sm text-neutral-400">CASE #{report.caseId}</div>
              <h2 className="mt-1 font-semibold text-xl tracking-tight">Crime Scene Report</h2>
              <div className="mt-3 leading-7 text-[15px]">
                <ReportSections text={report.report} />
              </div>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 p-4 backdrop-blur bg-black/40 border-t border-crime-border">
            <div className="max-w-3xl mx-auto grid grid-cols-2 gap-3">
              <button className="btn btn-ghost" onClick={reset}>New Analysis</button>
              <button className="btn btn-primary" disabled={exporting} onClick={doShare}>{exporting ? 'Preparing…' : 'Share'}</button>
            </div>
          </div>
        </section>
      )}

      <Lightbox open={lightboxOpen} onClose={() => setLightboxOpen(false)} src={previewURL || ''} alt="Image preview" />
    </ColdOpenSplash>
  );
}
