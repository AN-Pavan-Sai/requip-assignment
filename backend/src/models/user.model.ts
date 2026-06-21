/**
 * User entity interface.
 * Maps directly to the `users` table in MySQL.
 *
 * Design decisions:
 * - UUID for `id` instead of auto-increment to prevent enumeration attacks
 * - `isDeleted` flag for soft-delete to preserve data integrity & audit trails
 * - `createdAt` / `updatedAt` timestamps for traceability
 * - Aadhaar, PAN, email have unique constraints enforced at DB level
 */
export interface User {
  id: string;
  name: string;
  email: string;
  primaryMobile: string;
  secondaryMobile: string | null;
  aadhaar: string;
  pan: string;
  dateOfBirth: string;
  placeOfBirth: string;
  currentAddress: string;
  permanentAddress: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new user.
 * Excludes auto-generated fields (id, isDeleted, timestamps).
 */
export interface CreateUserDTO {
  name: string;
  email: string;
  primaryMobile: string;
  secondaryMobile?: string;
  aadhaar: string;
  pan: string;
  dateOfBirth: string;
  placeOfBirth: string;
  currentAddress: string;
  permanentAddress: string;
}

/**
 * DTO for updating an existing user.
 * All fields optional — supports partial updates.
 */
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  primaryMobile?: string;
  secondaryMobile?: string;
  aadhaar?: string;
  pan?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  currentAddress?: string;
  permanentAddress?: string;
}

/**
 * Paginated response wrapper for list endpoints.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
