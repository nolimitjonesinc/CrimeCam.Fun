'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from '@/components/TypewriterText';
import { ShareModal } from '@/components/ShareModal';
import ColdOpenSplash from '@/components/splash/ColdOpenSplash';
import { applyFilterToImageForAI, compressImage, fileToBase64, generateCaseNumber, isHEICFile, convertHEICToJPEG } from '@/lib/utils';
import Lightbox from '@/components/Lightbox';
import { exportCompositeImage } from '@/lib/export';
import { normalizeReport } from '@/lib/normalize';
import { useHistory } from '@/components/history/useHistory';

const MAX_SIZE_MB = 10;

type FilterKind = 'none' | 'noir' | 'sepia';

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
  const [filter, setFilter] = useState<FilterKind>('none');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<'idle' | 'upload' | 'analyzing' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [applyToAI, setApplyToAI] = useState(false);
  const { addItem } = useHistory();

  useEffect(() => () => { if (previewURL) URL.revokeObjectURL(previewURL); }, [previewURL]);

  const filteredStyle = useMemo(() => {
    switch (filter) {
      case 'noir':
        return { filter: 'grayscale(100%) contrast(120%) brightness(90%)' } as const;
      case 'sepia':
        return { filter: 'sepia(100%) contrast(110%)' } as const;
      default:
        return {} as const;
    }
  }, [filter]);

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
      let fileForAI = imageFile;
      if (applyToAI && filter !== 'none') {
        try { fileForAI = await applyFilterToImageForAI(imageFile, filter); } catch {}
      }
      const base64 = await fileToBase64(fileForAI);
      setProgress('analyzing');
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 })
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

  async function doExport() {
    if (!previewURL || !report) return;
    try {
      setExporting(true);
      const blob = await exportCompositeImage({ src: previewURL, caseId: report.caseId, report: report.report, filter, useShortText: false });
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
    setImageFile(null); setPreviewURL(null); setReport(null); setError(null); setProgress('idle'); setFilter('none');
  }

  return (
    <ColdOpenSplash skipIfSeen={true}>
      {/* Upload / Preview */}
      {!previewURL && (
        <section className="mt-6">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <img src="/crimecam-icon.jpg" alt="CrimeCam.Fun" className="h-8 w-8 rounded-md border border-crime-border object-cover" />
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
              <p className="text-neutral-400 text-sm">JPG/PNG/HEIC · ≤10MB</p>
              <div className="flex gap-3 mt-1">
                <button className="btn btn-ghost" onClick={() => inputRef.current?.click()}>Choose File</button>
                <label className="btn btn-primary cursor-pointer">
                  <input type="file" accept="image/*,.heic,.heif" capture="environment" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
                  Use Camera
                </label>
              </div>
              <input ref={inputRef} type="file" accept="image/*,.heic,.heif" className="hidden"
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
            <img src={previewURL} alt="Preview" className="w-full rounded-2xl border border-crime-border shadow-crime cursor-zoom-in" style={filteredStyle} onClick={() => setLightboxOpen(true)} />
            <div className="absolute left-3 bottom-3 flex gap-2">
              <button className={`btn ${filter==='none'?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter('none')}>Original</button>
              <button className={`btn ${filter==='noir'?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter('noir')}>Noir</button>
              <button className={`btn ${filter==='sepia'?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter('sepia')}>Sepia</button>
            </div>
            <label className="ml-2 mt-2 inline-flex text-xs text-neutral-300 items-center gap-2 border border-crime-border rounded-xl px-2 py-1 bg-crime-surface/70">
              <input type="checkbox" checked={applyToAI} onChange={(e)=>setApplyToAI(e.target.checked)} />
              Apply to analysis
            </label>
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
                  className="w-full rounded-2xl border border-crime-border shadow-crime cursor-zoom-in"
                  style={filteredStyle}
                  onClick={() => setLightboxOpen(true)}
                />
              )}
            </div>
            <div className="card p-5 max-h-[70vh] overflow-y-auto">
              <div className="text-sm text-neutral-400">CASE #{report.caseId}</div>
              <h2 className="mt-1 font-semibold text-xl tracking-tight">Crime Scene Report</h2>
              <div className="mt-3 typewriter leading-7 text-[15px]">
                <TypewriterText text={report.report}/>
              </div>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 p-4 backdrop-blur bg-black/40 border-t border-crime-border">
            <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button className="btn btn-ghost" onClick={reset}>New Analysis</button>
              <button className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(report.report)}>Copy</button>
              <button className="btn btn-primary" onClick={() => setShareOpen(true)}>Share</button>
              <button className="btn btn-ghost" disabled={exporting} onClick={doExport}>{exporting ? 'Exporting…' : 'Export'}</button>
            </div>
          </div>
        </section>
      )}

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} textFull={report?.report ?? ''} textShort={report?.shortText ?? ''} />
      <Lightbox open={lightboxOpen} onClose={() => setLightboxOpen(false)} src={previewURL || ''} alt="Image preview" />
    </ColdOpenSplash>
  );
}
