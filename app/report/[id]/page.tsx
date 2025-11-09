import { kv } from '@vercel/kv';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { StoredReport } from '@/lib/storage';
import { ReportSections } from '@/components/ReportSections';
import { GroupRoastCarousel } from '@/components/GroupRoastCarousel';
import { NiceOrNaughtyReport } from '@/components/NiceOrNaughtyReport';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

async function getReport(id: string): Promise<StoredReport | null> {
  try {
    const data = await kv.get(`report:${id}`);
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : data as StoredReport;
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return {
      title: 'Report Not Found',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crimescene.fun';
  const shortReport = report.report.substring(0, 200);

  return {
    title: `Case #${report.caseId} - Crime Scene Report`,
    description: shortReport + '...',
    openGraph: {
      title: `Case #${report.caseId} - SOLVED`,
      description: 'Click to see the full detective report',
      images: [report.imageUrl],
      url: `${baseUrl}/report/${id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Case #${report.caseId} - SOLVED`,
      description: 'Click to see the full detective report',
      images: [report.imageUrl],
    },
  };
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/" className="text-crime-red hover:underline text-sm">
            ← Generate Your Own Report
          </Link>
        </div>

        <div className="grid md:grid-cols-[1.1fr,1fr] gap-8 items-start">
          {/* Image */}
          <div className="space-y-3 md:sticky md:top-6 self-start">
            <div className="group relative">
              <img
                src={report.imageUrl}
                alt="Crime scene evidence"
                className="w-full max-h-[88vh] object-contain rounded-2xl border border-crime-border shadow-crime"
              />
            </div>
          </div>

          {/* Report */}
          <div className="card p-6 md:p-8">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              CASE #{report.caseId}
            </div>
            {report.telemetry && (
              <div className="mt-1 text-xs text-neutral-500">
                <span className="inline-flex items-center gap-1">
                  {report.telemetry.provider === 'anthropic' ? 'Claude' : 'GPT'}
                  {report.telemetry.fallbackUsed && (
                    <span className="text-yellow-500" title={report.telemetry.fallbackReason}> (fallback)</span>
                  )}
                  • {(report.telemetry.durationMs / 1000).toFixed(1)}s
                </span>
              </div>
            )}
            <h2 className="mt-2 font-bold text-2xl tracking-tight text-neutral-50">
              {report.mode === 'group_roast' ? 'Group Analysis' :
               report.mode === 'elf' ? 'Nice or Naughty Report' :
               'Crime Scene Report'}
            </h2>

            <div className="mt-5">
              {report.mode === 'group_roast' ? (
                <GroupRoastCarousel text={report.report} />
              ) : report.mode === 'elf' ? (
                <NiceOrNaughtyReport text={report.report} />
              ) : (
                <ReportSections text={report.report} />
              )}
            </div>

            {/* CTA */}
            <div className="mt-8 p-6 bg-crime-surface border border-crime-border rounded-lg text-center">
              <h3 className="font-bold text-lg mb-2">Want Your Own Report?</h3>
              <p className="text-sm text-neutral-400 mb-4">
                Upload your photo and get a hilariously sarcastic analysis
              </p>
              <Link href="/" className="btn btn-primary inline-block">
                Generate Your Report
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-neutral-500">
          Report created {new Date(report.createdAt).toLocaleDateString()}
        </div>
      </main>
    </div>
  );
}
