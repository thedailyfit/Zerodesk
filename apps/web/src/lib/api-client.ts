/**
 * ZeroDesk Unified API Client
 * Connects frontend dashboard components to @zerodesk/api NestJS backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

export type TokenProvider = () => Promise<string | null>;
export type TenantIdProvider = () => string | null;

let globalTokenProvider: TokenProvider = async () => {
  if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
    return await (window as any).Clerk.session.getToken();
  }
  return null;
};

let globalTenantIdProvider: TenantIdProvider = () => {
  if (typeof window === 'undefined') return null;
  // Check SuperAdmin Ghost Mode impersonation first
  const ghostTenant = localStorage.getItem('zerodesk_impersonated_tenant_id');
  if (ghostTenant) return ghostTenant;
  // Check active organization or persisted tenant
  return (
    (window as any).Clerk?.organization?.id ||
    localStorage.getItem('zerodesk_tenant_id') ||
    null
  );
};

export const configureApiClient = (config: {
  tokenProvider?: TokenProvider;
  tenantIdProvider?: TenantIdProvider;
}) => {
  if (config.tokenProvider) globalTokenProvider = config.tokenProvider;
  if (config.tenantIdProvider) globalTenantIdProvider = config.tenantIdProvider;
};

export interface ApiClientOptions extends RequestInit {
  token?: string;
  tenantId?: string;
  skipAuth?: boolean;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { token: manualToken, tenantId: manualTenantId, skipAuth, headers = {}, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = manualToken || (await globalTokenProvider());
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const tenantId = manualTenantId || globalTenantIdProvider();
    if (tenantId) {
      requestHeaders['x-tenant-id'] = tenantId;
    }
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  let response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
  });

  // Handle 401: Attempt single token refresh if available
  if (response.status === 401 && !skipAuth && typeof window !== 'undefined' && (window as any).Clerk?.session) {
    try {
      const refreshedToken = await (window as any).Clerk.session.getToken({ skipCache: true });
      if (refreshedToken) {
        requestHeaders['Authorization'] = `Bearer ${refreshedToken}`;
        response = await fetch(url, { ...rest, headers: requestHeaders });
      }
    } catch {
      // Re-authentication failed
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.message || errorMessage;
    } catch {
      // Body is not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  get: <T = any>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: ApiClientOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
