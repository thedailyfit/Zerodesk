export default function AppointmentsLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-56 bg-slate-800 rounded-lg" />
        <div className="h-10 w-36 bg-slate-800 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-800/60 rounded-xl border border-slate-800" />
        ))}
      </div>
      <div className="h-96 bg-slate-800/30 rounded-2xl border border-slate-800" />
    </div>
  );
}
