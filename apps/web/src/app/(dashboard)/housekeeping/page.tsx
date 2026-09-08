'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/appointments');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-xs text-[var(--color-text-secondary)]">
      Redirecting to clinical appointments...
    </div>
  );
}
