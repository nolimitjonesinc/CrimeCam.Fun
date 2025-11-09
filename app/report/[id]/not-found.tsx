import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-crime-red mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
        <p className="text-neutral-400 mb-6">
          This case file has been lost, destroyed, or never existed. Classic bureaucracy.
        </p>
        <Link href="/" className="btn btn-primary inline-block">
          Generate a New Report
        </Link>
      </div>
    </div>
  );
}
