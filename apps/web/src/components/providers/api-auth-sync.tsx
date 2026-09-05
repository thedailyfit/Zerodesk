'use client';

import { useEffect } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { configureApiClient } from '@/lib/api-client';
import { useSuperAdminStore } from '@/lib/superadmin-store';

export function ApiAuthSync() {
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const impersonatedTenantId = useSuperAdminStore((s) => s.impersonatedTenantId);

  useEffect(() => {
    configureApiClient({
      tokenProvider: async () => {
        try {
          return await getToken();
        } catch {
          return null;
        }
      },
      tenantIdProvider: () => {
        if (impersonatedTenantId) return impersonatedTenantId;
        if (organization?.id) return organization.id;
        if (typeof window !== 'undefined') {
          return localStorage.getItem('zerodesk_tenant_id') || null;
        }
        return null;
      },
    });
  }, [getToken, organization?.id, impersonatedTenantId]);

  return null;
}
