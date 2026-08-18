'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-400 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-slate-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
