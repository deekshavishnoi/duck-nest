'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--background)]">
      <p className="text-5xl mb-3">🦆💔</p>
      <h2 className="text-lg font-bold text-slate-700 mb-1">Something went wrong</h2>
      <p className="text-sm text-slate-500 mb-5 text-center max-w-xs">
        Don&apos;t worry — your data is safe. Try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-blue-200"
      >
        Try again
      </button>
    </div>
  );
}
