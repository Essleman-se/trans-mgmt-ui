import { useState, useEffect } from 'react';
import {
  authFetch,
  emailFromAuthToken,
  getApiUrl,
  isAuthRedirectResponse,
} from '../../utils/api';
import { normalizeEmail } from '../../utils/email';

interface UserCountProps {
  isAuthenticated: boolean;
  compact?: boolean; // For navbar display
}

async function fetchUserByEmail(email: string): Promise<Response> {
  const apiUrl = `${getApiUrl('/api/users/by-email')}?email=${encodeURIComponent(email)}`;
  return authFetch(apiUrl, { method: 'GET' });
}

async function parseUserResponse(response: Response): Promise<Record<string, unknown>> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    if (response.status === 404) {
      throw new Error(`User account not found for ${response.url}`);
    }
    throw new Error(
      text
        ? `Unexpected server response (${response.status}): ${text.slice(0, 120)}`
        : `Unexpected server response (${response.status})`,
    );
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = (await response.json()) as { message?: string };
      errorMessage = errorData.message || errorMessage;
    } catch {
      // use default message
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as Record<string, unknown>;
}

const UserCount = ({ isAuthenticated, compact = false }: UserCountProps) => {
  const [userInfo, setUserInfo] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const storedEmail = localStorage.getItem('userEmail')?.trim() || '';
        const tokenEmail = emailFromAuthToken(token);
        const lookupEmail = tokenEmail || (storedEmail ? normalizeEmail(storedEmail) : '');

        if (!lookupEmail) {
          throw new Error('No user email found. Please sign in again.');
        }
        if (!token) {
          throw new Error('Your session has expired. Please sign in again.');
        }

        let response = await fetchUserByEmail(lookupEmail);

        if (isAuthRedirectResponse(response)) {
          throw new Error('Your session has expired. Please sign in again.');
        }

        // Retry with stored email if JWT subject casing differs from localStorage.
        if (
          response.status === 404 &&
          storedEmail &&
          storedEmail !== lookupEmail
        ) {
          const retryResponse = await fetchUserByEmail(storedEmail);
          if (!isAuthRedirectResponse(retryResponse)) {
            response = retryResponse;
          }
        }

        const data = await parseUserResponse(response);
        setUserInfo(data);
      } catch (err) {
        const message =
          err instanceof TypeError && err.message === 'Failed to fetch'
            ? 'Unable to reach the server. Make sure the backend is running on port 8080.'
            : err instanceof Error
              ? err.message
              : 'Failed to fetch user information';
        setError(message);
        console.error('Error fetching user info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [isAuthenticated]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Compact view for navbar - returns user info for dropdown
  if (compact) {
    if (loading) {
      return (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      );
    }

    const email = localStorage.getItem('userEmail') || '';
    const displayName = userInfo
      ? ((userInfo.firstName as string) ||
          (userInfo.name as string) ||
          (userInfo.username as string) ||
          email.split('@')[0] ||
          'User')
      : email.split('@')[0] || 'User';

    return (
      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0">
        {displayName.charAt(0).toUpperCase()}
      </div>
    );
  }

  // Full view for main page
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading user information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-red-600 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  // Display all fields from API
  const excludeKeys = ['password', 'id']; // Exclude sensitive fields
  const userFields = Object.entries(userInfo).filter(([key]) => !excludeKeys.includes(key.toLowerCase()));

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">User Account</h2>
      <div className="space-y-3">
        {userFields.map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
            <span className="text-sm font-medium text-gray-500 sm:w-32 capitalize shrink-0">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="text-base sm:text-lg text-gray-900 wrap-break-word">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserCount;
