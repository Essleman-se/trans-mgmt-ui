/**
 * API Configuration Utility
 * Handles API base URL for both development and production environments
 */

const PRODUCTION_API_BASE_URL =
  'https://trans-mgmt-backend-prod-f9c317c03601.herokuapp.com';

/**
 * Get the API base URL based on the environment
 * - In development: empty string (relative /api/* proxied by Vite to localhost:8080)
 * - In production: Heroku backend URL from VITE_API_BASE_URL or hardcoded default
 */
export const getApiBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    return '';
  }

  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  return fromEnv || PRODUCTION_API_BASE_URL;
};

/**
 * Build a full API URL
 * @param endpoint - API endpoint (e.g., '/api/auth/login')
 * @returns Full URL to the API endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If baseUrl is empty (development), return the endpoint as-is (for proxy)
  if (!baseUrl) {
    return cleanEndpoint;
  }
  
  // In production, combine base URL with endpoint
  return `${baseUrl}${cleanEndpoint}`;
};

/** Authorization + Accept headers for authenticated API calls. */
export function getAuthHeaders(extra?: HeadersInit): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (extra) {
    if (extra instanceof Headers) {
      extra.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(extra)) {
      for (const [key, value] of extra) {
        headers[key] = value;
      }
    } else {
      Object.assign(headers, extra);
    }
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/** Spring Security may redirect unauthenticated API calls to OAuth2 (302), which breaks browser fetch. */
export function isAuthRedirectResponse(response: Response): boolean {
  return (
    response.type === 'opaqueredirect' ||
    response.status === 301 ||
    response.status === 302 ||
    response.status === 303 ||
    response.status === 307 ||
    response.status === 308
  );
}

/**
 * Authenticated fetch that does not follow OAuth2 login redirects.
 * Prevents opaque "Failed to fetch" errors when a session expires.
 */
export function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: getAuthHeaders(init.headers),
    redirect: 'manual',
  });
}

/** Email claim from JWT subject (matches backend user record casing). */
export function emailFromAuthToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized)) as { sub?: unknown };
    return typeof decoded.sub === 'string' && decoded.sub.trim() ? decoded.sub.trim() : null;
  } catch {
    return null;
  }
}

