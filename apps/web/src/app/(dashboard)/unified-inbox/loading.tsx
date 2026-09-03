export default function UnifiedInboxLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden animate-pulse">
      <div className="w-80 border-r border-slate-800 p-4 space-y-4">
        <div className="h-9 bg-slate-800 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="h-10 w-10 bg-slate-800 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-28 bg-slate-800 rounded" />
                <div className="h-3 w-40 bg-slate-800/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between p-6">
        <div className="h-14 border-b border-slate-800 flex items-center justify-between">
          <div className="h-5 w-40 bg-slate-800 rounded" />
          <div className="h-8 w-24 bg-slate-800 rounded" />
        </div>
        <div className="space-y-4 py-6">
          <div className="h-12 w-64 bg-slate-800/60 rounded-xl" />
          <div className="h-16 w-80 bg-blue-900/20 rounded-xl ml-auto" />
        </div>
        <div className="h-12 bg-slate-800/50 rounded-xl" />
      </div>
    </div>
  );
}
