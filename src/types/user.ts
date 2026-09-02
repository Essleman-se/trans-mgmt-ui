/** Matches backend role values stored in JWT and AuthResponseDTO. */
export type UserRole = 'ADMIN' | 'USER';

/** User record returned by GET/POST/PATCH /api/users (UserResponseDTO). */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
}

/** Body for POST /api/users (UserRequestDTO). Password required when creating via admin UI. */
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
}

/** Body for PATCH /api/users/{id} (UserPatchDTO). All fields optional. */
export interface PatchUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}
