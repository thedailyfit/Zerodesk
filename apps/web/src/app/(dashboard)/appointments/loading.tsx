export default function AppointmentsLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-800/60 rounded-xl" />
        <div className="h-10 w-36 bg-slate-800/60 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 space-y-2">
            <div className="h-4 w-20 bg-slate-800 rounded" />
            <div className="h-6 w-12 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
      <div className="h-96 bg-slate-900/40 border border-slate-800/40 rounded-3xl p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-slate-800/40 rounded-2xl flex items-center px-4 justify-between">
            <div className="h-4 w-32 bg-slate-700/60 rounded" />
            <div className="h-4 w-24 bg-slate-700/60 rounded" />
            <div className="h-6 w-16 bg-slate-700/60 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
