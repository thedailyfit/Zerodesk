export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Super Admin Nav */}
      <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-6">
        <div className="font-bold text-[var(--color-error)]">ZeroDesk Admin</div>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
