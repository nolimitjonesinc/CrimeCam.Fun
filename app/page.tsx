'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from '@/components/TypewriterText';
import { ShareModal } from '@/components/ShareModal';
import { CrimeTapeHeader } from '@/components/headers/CrimeTapeHeader';
import { applyFilterToImageForAI, compressImage, fileToBase64, generateCaseNumber } from '@/lib/utils';
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
    if (!file.type.startsWith('image/')) { setError('Unsupported file type. Use JPG/PNG.'); return; }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) { setError('Max size is 10MB.'); return; }

    let finalFile = file;
    try {
      finalFile = await compressImage(file, 1600, 0.85);
    } catch {}

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
      if (!res.ok) throw new Error(`Analyze failed (${res.status})`);
      const data = await res.json();
      const caseId = generateCaseNumber();
      const report: string = data.report ?? 'Case file corrupted. Investigation inconclusive.';
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

  function reset() {
    setImageFile(null); setPreviewURL(null); setReport(null); setError(null); setProgress('idle'); setFilter('none');
  }

  return (
    <main className="px-4 pb-28 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <CrimeTapeHeader />

      {/* Upload / Preview */}
      {!previewURL && (
        <section className="mt-6">
          <div
            className={`dropzone ${dragHover ? 'hover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragHover(true); }}
            onDragLeave={() => setDragHover(false)}
            onDrop={(e) => { e.preventDefault(); setDragHover(false); const f = e.dataTransfer.files?.[0]; if (f) onPick(f); }}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="text-xl font-semibold">Upload Evidence</h2>
              <p className="text-neutral-400 text-sm">Drag & drop or use camera. JPG/PNG · ≤10MB</p>
              <div className="flex gap-3 mt-2">
                <button className="btn btn-ghost" onClick={() => inputRef.current?.click()}>Choose File</button>
                <label className="btn btn-primary cursor-pointer">
                  <input type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
                  Use Camera
                </label>
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
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
            <img src={previewURL} alt="Preview" className="w-full rounded-2xl border border-crime-border shadow-crime" style={filteredStyle} />
            <div className="absolute left-3 bottom-3 flex gap-2">
              <button className={`btn ${filter==='none'?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter('none')}>Original</button>
              <button className={`btn ${filter==='noir'?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter('noir')}>Noir</button>
              <button className={`btn ${filter==='sepia'?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter('sepia')}>Sepia</button>
            </div>
            <label className="ml-2 text-xs text-neutral-300 flex items-center gap-2 border border-crime-border rounded-xl px-2 py-1 bg-crime-surface/70">
              <input type="checkbox" checked={applyToAI} onChange={(e)=>setApplyToAI(e.target.checked)} />
              Apply to analysis
            </label>
          </div>

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
        <section className="mt-6 space-y-4">
          <div className="rounded-2xl border border-crime-border bg-crime-surface p-5 shadow-crime">
            <div className="text-sm text-neutral-400">CASE #{report.caseId}</div>
            <h2 className="mt-1 font-semibold text-lg">AI Detective Report</h2>
            <div className="mt-3 typewriter">
              <TypewriterText text={report.report}/>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 p-4 backdrop-blur bg-black/40 border-t border-crime-border">
            <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3">
              <button className="btn btn-ghost" onClick={reset}>New Analysis</button>
              <button className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(report.report)}>Copy</button>
              <button className="btn btn-primary" onClick={() => setShareOpen(true)}>Share</button>
            </div>
          </div>
        </section>
      )}

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} textFull={report?.report ?? ''} textShort={report?.shortText ?? ''} />
    </main>
  );
}