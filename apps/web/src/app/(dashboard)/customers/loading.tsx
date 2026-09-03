export default function CustomersLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-800 rounded-lg" />
        <div className="h-10 w-32 bg-slate-800 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-800/60 rounded-xl border border-slate-800" />
        ))}
      </div>
      <div className="h-96 bg-slate-800/40 rounded-xl border border-slate-800" />
    </div>
  );
}
