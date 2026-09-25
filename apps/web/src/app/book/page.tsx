'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingLink } from '@/lib/booking-link-store';
import PublicBookingPage from './[slug]/page';

export default function BookIndexPage() {
  const router = useRouter();
  const { config, isLoaded } = useBookingLink();

  const targetSlug = (isLoaded && config.slug?.trim()) ? config.slug.trim() : 'sanctuary-booking';

  useEffect(() => {
    if (isLoaded) {
      router.replace(`/book/${targetSlug}`);
    }
  }, [isLoaded, targetSlug, router]);

  const fallbackParams = Promise.resolve({ slug: targetSlug });
  return <PublicBookingPage params={fallbackParams} />;
}
