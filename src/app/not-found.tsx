import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--background)]">
      <p className="text-5xl mb-3">🦆❓</p>
      <h2 className="text-lg font-bold text-slate-700 mb-1">Page not found</h2>
      <p className="text-sm text-slate-500 mb-5 text-center max-w-xs">
        This page doesn&apos;t exist in your nest.
      </p>
      <Link
        href="/"
        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-200"
      >
        Back to nest
      </Link>
    </div>
  );
}
