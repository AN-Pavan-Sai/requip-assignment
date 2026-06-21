import axios from 'axios';
import type { UserFormData, PaginatedUsersResponse, UserResponse } from '../types/user';

/**
 * Axios instance pre-configured for the backend API.
 */
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * User API service methods.
 * Typed wrappers around axios calls for all CRUD operations.
 */
export const userApi = {
  /**
   * Fetches a paginated list of users with optional search.
   */
  getAll: async (page = 1, limit = 10, search = ''): Promise<PaginatedUsersResponse> => {
    const params: Record<string, string | number> = { page, limit };
    if (search.trim()) {
      params.search = search.trim();
    }
    const response = await api.get<PaginatedUsersResponse>('/users', { params });
    return response.data;
  },

  /**
   * Creates a new user.
   */
  create: async (data: UserFormData): Promise<UserResponse> => {
    const payload = {
      ...data,
      secondaryMobile: data.secondaryMobile || undefined,
    };
    const response = await api.post<UserResponse>('/users', payload);
    return response.data;
  },

  /**
   * Updates an existing user by ID.
   */
  update: async (id: string, data: Partial<UserFormData>): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Soft-deletes a user by ID.
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userApi;
