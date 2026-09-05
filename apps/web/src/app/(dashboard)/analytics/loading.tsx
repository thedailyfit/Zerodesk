export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-56 bg-slate-800/60 rounded-xl" />
        <div className="h-10 w-48 bg-slate-800/60 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-3.5 space-y-2">
            <div className="h-4 w-16 bg-slate-800 rounded" />
            <div className="h-6 w-14 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-slate-900/40 border border-slate-800/40 rounded-3xl p-6" />
        <div className="h-72 bg-slate-900/40 border border-slate-800/40 rounded-3xl p-6" />
      </div>
    </div>
  );
}
