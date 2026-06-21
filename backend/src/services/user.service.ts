import { v4 as uuidv4 } from 'uuid';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/db';
import { User, CreateUserDTO, UpdateUserDTO, PaginatedResponse } from '../models/user.model';
import { AppError } from '../middleware/errorHandler';

/**
 * User Service — business logic layer.
 * Encapsulates all database operations for the User entity.
 * Uses parameterized queries throughout to prevent SQL injection.
 */
export class UserService {
  /**
   * Creates a new user with a generated UUID.
   * @throws 409 if email, aadhaar, or PAN already exists (handled by DB unique constraint via error handler)
   */
  async createUser(data: CreateUserDTO): Promise<User> {
    const id = uuidv4();

    const query = `
      INSERT INTO users (id, name, email, primaryMobile, secondaryMobile, aadhaar, pan, dateOfBirth, placeOfBirth, currentAddress, permanentAddress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      id,
      data.name,
      data.email,
      data.primaryMobile,
      data.secondaryMobile || null,
      data.aadhaar,
      data.pan,
      data.dateOfBirth,
      data.placeOfBirth,
      data.currentAddress,
      data.permanentAddress,
    ];

    await pool.execute<ResultSetHeader>(query, values);

    // Return the freshly created user
    const user = await this.getUserById(id);
    if (!user) {
      throw new AppError('Failed to create user', 500);
    }
    return user;
  }

  /**
   * Updates an existing user with partial data.
   * Only non-undefined fields in the DTO are updated.
   * @throws 404 if user not found or is soft-deleted
   */
  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    // Check if user exists and is not deleted
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Build dynamic SET clause from only the fields that were provided
    const fields: string[] = [];
    const values: any[] = [];

    const fieldMap: Record<string, any> = {
      name: data.name,
      email: data.email,
      primaryMobile: data.primaryMobile,
      secondaryMobile: data.secondaryMobile,
      aadhaar: data.aadhaar,
      pan: data.pan,
      dateOfBirth: data.dateOfBirth,
      placeOfBirth: data.placeOfBirth,
      currentAddress: data.currentAddress,
      permanentAddress: data.permanentAddress,
    };

    for (const [key, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND isDeleted = FALSE`;
    await pool.execute<ResultSetHeader>(query, values);

    const updatedUser = await this.getUserById(id);
    if (!updatedUser) {
      throw new AppError('Failed to retrieve updated user', 500);
    }
    return updatedUser;
  }

  /**
   * Retrieves a paginated list of non-deleted users.
   * Supports optional search across name, email, and mobile fields.
   *
   * @param page - Current page number (1-indexed)
   * @param limit - Items per page
   * @param search - Optional search term
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedResponse<User>> {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE isDeleted = FALSE';
    const params: any[] = [];

    if (search && search.trim()) {
      whereClause += ` AND (name LIKE ? OR email LIKE ? OR primaryMobile LIKE ?)`;
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Count total matching records for pagination metadata
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, params);
    const totalItems = (countResult[0] as any).total;

    // Fetch the page of records
    const dataQuery = `SELECT * FROM users ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
    const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, [...params, String(limit), String(offset)]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: rows as User[],
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Retrieves a single user by ID.
   * Returns null if not found or soft-deleted.
   */
  async getUserById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = ? AND isDeleted = FALSE';
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

    if ((rows as any[]).length === 0) {
      return null;
    }

    return (rows as any[])[0] as User;
  }

  /**
   * Soft-deletes a user by setting isDeleted = TRUE.
   * The record remains in the database for audit purposes.
   * @throws 404 if user not found or already deleted
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const query = 'UPDATE users SET isDeleted = TRUE WHERE id = ?';
    await pool.execute<ResultSetHeader>(query, [id]);
  }
}

// Export a singleton instance
export const userService = new UserService();
