import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mb-8 relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white text-xl font-bold">Z</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">ZeroDesk AI</h1>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              card: 'bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl shadow-black/10 rounded-2xl w-full',
              headerTitle: 'text-[var(--color-text)]',
              headerSubtitle: 'text-[var(--color-text-muted)]',
              socialButtonsBlockButton: 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text)]',
              socialButtonsBlockButtonText: 'font-medium',
              dividerLine: 'bg-[var(--color-border)]',
              dividerText: 'text-[var(--color-text-muted)]',
              formFieldLabel: 'text-[var(--color-text-secondary)]',
              formFieldInput: 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]',
              formButtonPrimary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium',
              footerActionText: 'text-[var(--color-text-muted)]',
              footerActionLink: 'text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]',
            }
          }}
        />
      </div>
    </div>
  );
}
