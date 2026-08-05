'use client';

import { useUser } from '@clerk/nextjs';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, useRef } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null>(null);
  const posthogInitialized = useRef(false);

  useEffect(() => {
    const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!projectToken || !host) {
      if (process.env.NODE_ENV === 'development') {
        const missingVariable = !projectToken
          ? 'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN'
          : 'NEXT_PUBLIC_POSTHOG_HOST';

        throw new Error(
          `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
        );
      }

      return;
    }

    posthog.init(projectToken, {
      api_host: host,
      defaults: '2026-01-30',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      capture_exceptions: true,
    });
    posthogInitialized.current = true;
  }, []);

  useEffect(() => {
    if (!isLoaded || !posthogInitialized.current) {
      return;
    }

    if (!user) {
      if (identifiedUserId.current) {
        posthog.reset();
        identifiedUserId.current = null;
      }
      return;
    }

    if (identifiedUserId.current && identifiedUserId.current !== user.id) {
      posthog.reset();
    }

    if (identifiedUserId.current !== user.id) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName ?? undefined,
      });
      identifiedUserId.current = user.id;
    }
  }, [isLoaded, user]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
