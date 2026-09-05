export default function CustomersLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-44 bg-slate-800/60 rounded-xl" />
        <div className="h-10 w-32 bg-slate-800/60 rounded-xl" />
      </div>
      <div className="h-12 bg-slate-900/60 border border-slate-800/60 rounded-2xl flex items-center px-4 gap-3">
        <div className="h-4 w-4 bg-slate-700 rounded" />
        <div className="h-4 w-64 bg-slate-800 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 6].map((i) => (
          <div key={i} className="h-44 bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-800" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-28 bg-slate-700 rounded" />
                <div className="h-3 w-36 bg-slate-800 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-slate-800/60 rounded" />
            <div className="h-6 w-20 bg-slate-700/60 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
