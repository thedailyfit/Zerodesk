export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-white" />
        <p className="text-sm text-slate-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
