export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-800 rounded-lg" />
        <div className="h-9 w-40 bg-slate-800 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-800/60 rounded-xl border border-slate-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-slate-800/40 rounded-2xl border border-slate-800" />
        <div className="h-72 bg-slate-800/40 rounded-2xl border border-slate-800" />
      </div>
    </div>
  );
}
