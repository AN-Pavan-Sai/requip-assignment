/**
 * User entity type — mirrors backend model.
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
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating/editing a user.
 */
export interface UserFormData {
  name: string;
  email: string;
  primaryMobile: string;
  secondaryMobile: string;
  aadhaar: string;
  pan: string;
  dateOfBirth: string;
  placeOfBirth: string;
  currentAddress: string;
  permanentAddress: string;
}

/**
 * Pagination metadata from the API.
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * API response wrapper for paginated list endpoints.
 */
export interface PaginatedUsersResponse {
  success: boolean;
  data: User[];
  pagination: PaginationInfo;
}

/**
 * API response wrapper for single-user endpoints.
 */
export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

/**
 * API error response.
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ msg: string; path: string }>;
}
