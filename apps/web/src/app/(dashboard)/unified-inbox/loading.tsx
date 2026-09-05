export default function UnifiedInboxLoading() {
  return (
    <div className="h-[calc(100vh-5rem)] grid grid-cols-1 md:grid-cols-12 gap-0 border border-slate-800/80 rounded-3xl overflow-hidden bg-slate-950 animate-pulse">
      <div className="md:col-span-4 border-r border-slate-800/80 p-4 space-y-4">
        <div className="h-10 bg-slate-900 rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-18 bg-slate-900/60 rounded-2xl p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-24 bg-slate-700 rounded" />
                <div className="h-3 w-40 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="md:col-span-8 p-6 flex flex-col justify-between">
        <div className="h-12 border-b border-slate-800 pb-4 flex items-center justify-between">
          <div className="h-5 w-32 bg-slate-800 rounded" />
          <div className="h-6 w-20 bg-slate-800 rounded-full" />
        </div>
        <div className="space-y-4 my-8">
          <div className="h-14 w-2/3 bg-slate-900 rounded-2xl p-3" />
          <div className="h-14 w-1/2 bg-blue-950/40 rounded-2xl p-3 ml-auto" />
          <div className="h-14 w-3/5 bg-slate-900 rounded-2xl p-3" />
        </div>
        <div className="h-12 bg-slate-900 rounded-2xl" />
      </div>
    </div>
  );
}
