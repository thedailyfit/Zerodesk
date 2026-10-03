'use client';
import { Fragment, useLayoutEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { configureApiClient } from '@/lib/api-client';
import { setStorageScope } from '@/lib/tenant-storage';
import { useSuperAdminStore } from '@/lib/superadmin-store';
let previousUserId: string | null | undefined;

export function TenantBoundary({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId, orgId, getToken } = useAuth();
  const impersonated = useSuperAdminStore(s => s.impersonatedTenantId);
  const tenantId = impersonated || orgId || null;
  const identity = isLoaded && userId ? `${userId}:${tenantId || 'personal'}` : null;
  const [ready, setReady] = useState<string | null>(null);
  useLayoutEffect(() => {
    if (previousUserId !== userId) {
      useSuperAdminStore.setState({ tenants: [], impersonatedTenantId: null });
      previousUserId = userId;
    }
    setStorageScope(identity);
    configureApiClient({ tokenProvider: () => getToken(), tenantIdProvider: () => tenantId });
    setReady(identity);
    return () => { setStorageScope(null); };
  }, [identity, tenantId, getToken, userId]);
  if (!identity || ready !== identity) return null;
  return <Fragment key={identity}>{children}</Fragment>;
}
