import type { UserRole } from '../types/user';

export const USER_ROLE_STORAGE_KEY = 'userRole';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeRole(value: unknown): UserRole | null {
  if (value === 'ADMIN' || value === 'USER') {
    return value;
  }
  return null;
}

/** Read role claim from JWT (backend sets claim name `role`). */
export function roleFromAuthToken(token: string | null): UserRole | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return payload ? normalizeRole(payload.role) : null;
}

export function persistUserRole(role: string | null | undefined): void {
  const normalized = normalizeRole(role);
  if (normalized) {
    localStorage.setItem(USER_ROLE_STORAGE_KEY, normalized);
  } else {
    localStorage.removeItem(USER_ROLE_STORAGE_KEY);
  }
}

export function clearUserRole(): void {
  localStorage.removeItem(USER_ROLE_STORAGE_KEY);
}

/**
 * Current user role: prefers localStorage (set at login), falls back to JWT claim.
 */
export function getRoleFromToken(token?: string | null): UserRole | null {
  const stored = localStorage.getItem(USER_ROLE_STORAGE_KEY);
  const fromStorage = normalizeRole(stored);
  if (fromStorage) return fromStorage;

  const authToken = token ?? localStorage.getItem('token');
  return roleFromAuthToken(authToken);
}

export function isAdmin(token?: string | null): boolean {
  return getRoleFromToken(token) === 'ADMIN';
}

export function hasRole(role: UserRole, token?: string | null): boolean {
  return getRoleFromToken(token) === role;
}

/** Persist role after login from API response and/or JWT. */
export function syncUserRoleFromLogin(data: { token?: string; role?: string }): void {
  const fromResponse = normalizeRole(data.role);
  if (fromResponse) {
    persistUserRole(fromResponse);
    return;
  }
  if (data.token) {
    persistUserRole(roleFromAuthToken(data.token) ?? undefined);
  }
}
