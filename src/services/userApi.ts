import { authFetch, getApiUrl, isAuthRedirectResponse } from '../utils/api';
import { messageFromApiErrorBody } from '../utils/apiErrors';
import type { CreateUserRequest, PatchUserRequest, User } from '../types/user';

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (isAuthRedirectResponse(response)) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(
      text
        ? `Unexpected server response (${response.status}): ${text.slice(0, 120)}`
        : `Unexpected server response (${response.status})`,
    );
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = messageFromApiErrorBody(errorData) || errorMessage;
    } catch {
      // use default message
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

function rethrowNetworkError(err: unknown): never {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    throw new Error('Unable to reach the server. Make sure the backend is running on port 8080.');
  }
  throw err;
}

/** GET /api/users — list all users (requires JWT USER or ADMIN). */
export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await authFetch(getApiUrl('/api/users'), { method: 'GET' });
    return await parseJsonResponse<User[]>(response);
  } catch (err) {
    rethrowNetworkError(err);
  }
}

/** GET /api/users/{id} — single user by id. */
export async function fetchUserById(id: number): Promise<User> {
  try {
    const response = await authFetch(getApiUrl(`/api/users/${id}`), { method: 'GET' });
    return await parseJsonResponse<User>(response);
  } catch (err) {
    rethrowNetworkError(err);
  }
}

/** POST /api/users — create a user (requires JWT USER or ADMIN). */
export async function createUser(data: CreateUserRequest): Promise<User> {
  try {
    const response = await authFetch(getApiUrl('/api/users'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await parseJsonResponse<User>(response);
  } catch (err) {
    rethrowNetworkError(err);
  }
}

/** PATCH /api/users/{id} — partial update (requires JWT USER or ADMIN). */
export async function updateUser(id: number, data: PatchUserRequest): Promise<User> {
  try {
    const response = await authFetch(getApiUrl(`/api/users/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await parseJsonResponse<User>(response);
  } catch (err) {
    rethrowNetworkError(err);
  }
}

/** DELETE /api/users/{id} — delete a user (requires ADMIN). */
export async function deleteUser(id: number): Promise<void> {
  try {
    const response = await authFetch(getApiUrl(`/api/users/${id}`), { method: 'DELETE' });

    if (isAuthRedirectResponse(response)) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    if (response.status === 204 || response.ok) {
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const errorData = await response.json();
      const message = messageFromApiErrorBody(errorData) || `HTTP error! status: ${response.status}`;
      throw new Error(message);
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  } catch (err) {
    rethrowNetworkError(err);
  }
}
