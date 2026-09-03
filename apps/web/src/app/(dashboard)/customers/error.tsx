'use client';

import { useEffect } from 'react';

export default function CustomersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Customers Page Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
        <div className="text-3xl mb-3">⚠️</div>
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load customer records</h3>
        <p className="text-sm text-slate-400 mb-4">{error.message || 'A network error occurred.'}</p>
        <button
          onClick={reset}
          className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-slate-200 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
