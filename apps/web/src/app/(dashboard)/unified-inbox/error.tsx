'use client';

import { useEffect } from 'react';

export default function UnifiedInboxError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unified Inbox Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center max-w-md backdrop-blur-md">
        <div className="text-3xl mb-3">💬</div>
        <h2 className="text-lg font-bold text-white mb-1">Live Inbox disconnected</h2>
        <p className="text-xs text-slate-400 mb-5">
          {error.message || 'Lost connection to real-time chat stream. Click below to reconnect.'}
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-500 shadow-md"
        >
          Reconnect Stream
        </button>
      </div>
    </div>
  );
}
