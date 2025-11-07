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
import ModeSelect from '@/components/ModeSelect';
import QualitySelect from '@/components/QualitySelect';
import type { ModelQuality } from '@/lib/providers';
import { ReportSections } from '@/components/ReportSections';
import { GroupRoastCarousel } from '@/components/GroupRoastCarousel';
import { NiceOrNaughtyReport } from '@/components/NiceOrNaughtyReport';
import { normalizeReport } from '@/lib/normalize';
import { useHistory } from '@/components/history/useHistory';

// Removed hard size limit; we still compress client-side

// Filters removed

type Report = {
  caseId: string;
  report: string;
  shortText: string;
  telemetry?: {
    provider: string;
    model: string;
    quality: string;
    durationMs: number;
    promptTokens?: number;
    completionTokens?: number;
    estimatedCost?: number;
    fallbackUsed?: boolean;
    fallbackReason?: string;
  };
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
  const [spice, setSpice] = useState<number>(() => {
    if (typeof window === 'undefined') return 7;
    const stored = localStorage.getItem('crimecam_spice');
    const v = stored ? parseInt(stored, 10) : 7;
    return Number.isFinite(v) ? Math.min(10, Math.max(1, v)) : 7;
  });
  const [quality, setQuality] = useState<ModelQuality>(() => {
    if (typeof window === 'undefined') return 'auto';
    return (localStorage.getItem('crimecam_quality') as ModelQuality) || 'auto';
  });
  const [availableQualities, setAvailableQualities] = useState<ModelQuality[]>(['auto']);
  // const [filter, setFilter] = useState<FilterKind>('none');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<'idle' | 'upload' | 'analyzing' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [context, setContext] = useState<string>('');
  // const [shareOpen, setShareOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  // const [applyToAI, setApplyToAI] = useState(false);
  const { addItem } = useHistory();

  useEffect(() => () => { if (previewURL) URL.revokeObjectURL(previewURL); }, [previewURL]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('crimecam_preset', presetId); }, [presetId]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('crimecam_spice', String(spice)); }, [spice]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('crimecam_quality', quality); }, [quality]);

  // Fetch available providers on mount
  useEffect(() => {
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => {
        if (data.availableQualities) {
          setAvailableQualities(data.availableQualities);
        }
      })
      .catch(console.error);
  }, []);

  // Filters removed; no style transforms

  async function onPick(file: File) {
    setError(null);
    if (!file) return;
    
    // Check if it's a HEIC file or regular image
    const isHeic = isHEICFile(file);
    if (!file.type.startsWith('image/') && !isHeic) { 
      setError('Unsupported file type.'); 
      return; 
    }
    
    // No hard max size; large images will be compressed before upload

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
      console.log('🔍 [CLIENT] Starting analysis, preset:', presetId);
      setLoading(true); setProgress('upload');
      const base64 = await fileToBase64(imageFile);
      console.log('🔍 [CLIENT] Image converted to base64, length:', base64.length);
      setProgress('analyzing');
      console.log('🔍 [CLIENT] Sending request to /api/analyze...');
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mode: presetId, context: context || undefined, spice, quality })
      });
      console.log('🔍 [CLIENT] Response received, status:', res.status);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('🔍 [CLIENT] API Error:', errorData);
        throw new Error(`Analyze failed (${res.status}): ${errorData.error || 'Unknown error'}`);
      }
      const data = await res.json();
      console.log('🔍 [CLIENT] Success! Report length:', data.report?.length || 0);
      const caseId = generateCaseNumber();
      let report: string = data.report ?? 'Case file corrupted. Investigation inconclusive.';
      try { report = normalizeReport(report); } catch {}
      const shortText = `CASE #${caseId}\n\n${report.substring(0, 260)}...`;
      const rep: Report = {
        caseId,
        report,
        shortText,
        telemetry: data.telemetry
      };
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
      const blob = await exportCompositeImage({ src: previewURL, caseId: report.caseId, report: report.report, filter: 'none', useShortText: false, titleOverride: exportTitle, format: 'jpeg' });
      const file = new File([blob], `crime-scene-${report.caseId}.jpg`, { type: 'image/jpeg' });
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
        <section className="mt-8 max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-50">Upload Evidence</h2>
            <p className="mt-3 text-neutral-300 text-base leading-relaxed">Present your evidence — we promise to overreact.</p>
          </div>
          <div
            className={`dropzone ${dragHover ? 'hover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragHover(true); }}
            onDragLeave={() => setDragHover(false)}
            onDrop={(e) => { e.preventDefault(); setDragHover(false); const f = e.dataTransfer.files?.[0]; if (f) onPick(f); }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-full max-w-sm">
                <label className="block text-left text-sm font-medium text-neutral-300 mb-2">Mode</label>
                <ModeSelect value={presetId} onChange={(id)=>setPresetId(id)} />
              </div>
              <div className="w-full max-w-sm">
                <label className="block text-left text-sm font-medium text-neutral-300 mb-1">Spice Level <span className="text-neutral-400">({spice})</span></label>
                <input type="range" min={1} max={10} value={spice} onChange={(e)=>setSpice(parseInt(e.target.value))} className="w-full" />
                <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
                  <span>Soft</span><span>Medium</span><span>Feral</span>
                </div>
              </div>
              <div className="w-full max-w-sm">
                <label className="block text-left text-sm font-medium text-neutral-300 mb-2">Quality</label>
                <QualitySelect value={quality} onChange={(q)=>setQuality(q)} availableQualities={availableQualities} />
              </div>
              {/* Removed file type/size hint per request */}
              <div className="flex gap-3 mt-2">
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
        <section className="mt-8 pb-24 max-w-3xl mx-auto" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}>
          <div className="relative group mb-6">
            <img src={previewURL} alt="Preview" className="w-full max-h-[50vh] sm:max-h-none object-contain rounded-2xl border border-crime-border shadow-crime cursor-zoom-in transition-all group-hover:border-neutral-600 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.55)]" onClick={() => setLightboxOpen(true)} />
          </div>

          {error && progress === 'error' && (
            <motion.div initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-4 text-sm text-red-400 p-3 rounded-lg border border-red-500/20 bg-red-500/10">
              <strong>Investigation Failed:</strong> {error}
            </motion.div>
          )}

          <div className="sticky bottom-0 p-5 backdrop-blur-xl bg-black/50 border-t border-crime-border/50">
            <div className="max-w-3xl mx-auto space-y-3">
              {/* Context Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">
                  {getPresetById(presetId).contextPrompt}
                  <span className="text-neutral-500 ml-1.5">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder={`e.g. "Microwaves fish at work" or "Claims to be a morning person"`}
                  maxLength={150}
                  className="w-full rounded-lg bg-crime-surface border border-crime-border px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 transition-all hover:border-neutral-600 focus:border-crime-red focus:outline-none focus:ring-1 focus:ring-crime-red/20"
                />
                <div className="mt-3">
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Spice Level <span className="text-neutral-500">({spice})</span></label>
                  <input type="range" min={1} max={10} value={spice} onChange={(e)=>setSpice(parseInt(e.target.value))} className="w-full" />
                  <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
                    <span>Soft</span><span>Medium</span><span>Feral</span>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-neutral-400 mb-2">Quality</label>
                  <QualitySelect value={quality} onChange={(q)=>setQuality(q)} availableQualities={availableQualities} />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button disabled={loading} className="btn btn-ghost flex-1" onClick={reset}>Back</button>
                <button
                  disabled={loading || (context.trim().length > 0 && context.trim().length < 3)}
                  className="btn btn-primary flex-[2]"
                  onClick={analyze}
                  title={context.trim().length > 0 && context.trim().length < 3 ? 'Context must be at least 3 characters' : ''}
                >
                  {loading ? (progress === 'upload' ? 'Uploading…' : 'Analyzing…') : 'Analyze Scene'}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {report && (
        <section className="mt-8 pb-24" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}>
          <div className="grid md:grid-cols-[1.1fr,1fr] gap-8 items-start">
            <div className="space-y-3 md:sticky md:top-6 self-start">
              {previewURL && (
                <div className="group relative">
                  <img
                    src={previewURL}
                    alt="Analyzed photo"
                    className="w-full max-h-[88vh] object-contain rounded-2xl border border-crime-border shadow-crime cursor-zoom-in transition-all group-hover:border-neutral-600 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
                    onClick={() => setLightboxOpen(true)}
                  />
                </div>
              )}
            </div>
            <div className="card p-6 md:p-8">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">CASE #{report.caseId}</div>
              {report.telemetry && (
                <div className="mt-1 text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    {report.telemetry.provider === 'anthropic' ? 'Claude' : 'GPT'}
                    {report.telemetry.fallbackUsed && (
                      <span className="text-yellow-500" title={report.telemetry.fallbackReason}> (fallback)</span>
                    )}
                    • {(report.telemetry.durationMs / 1000).toFixed(1)}s
                    {report.telemetry.estimatedCost && (
                      <span> • ${report.telemetry.estimatedCost.toFixed(4)}</span>
                    )}
                  </span>
                </div>
              )}
              <h2 className="mt-2 font-bold text-2xl tracking-tight text-neutral-50">
                {presetId === 'group_roast' ? 'Group Analysis' : 'Crime Scene Report'}
              </h2>
              <div className="mt-5">
                {presetId === 'group_roast' ? (
                  <GroupRoastCarousel text={report.report} />
                ) : presetId === 'elf' ? (
                  <NiceOrNaughtyReport text={report.report} />
                ) : (
                  <ReportSections text={report.report} />
                )}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 p-5 backdrop-blur-xl bg-black/50 border-t border-crime-border/50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
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
