import { UserService } from '../services/user.service';
import { CreateUserDTO, UpdateUserDTO } from '../models/user.model';

/**
 * Unit tests for UserService.
 * Mocks the MySQL connection pool to isolate business logic from the database.
 */

// ── Mock the DB pool ──────────────────────────────────
// jest.mock is hoisted above all other code, so we cannot reference
// variables declared with const/let. Use jest.fn() directly in the factory.
jest.mock('../config/db', () => {
  return {
    __esModule: true,
    default: {
      execute: jest.fn(),
    },
  };
});

// Import the mocked module to get a reference to the mock function
import pool from '../config/db';
const mockExecute = pool.execute as jest.Mock;


// Mock uuid to return a predictable value
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234-5678-9012',
}));

describe('UserService', () => {
  let service: UserService;

  const mockUser = {
    id: 'test-uuid-1234-5678-9012',
    name: 'John Doe',
    email: 'john@example.com',
    primaryMobile: '9876543210',
    secondaryMobile: null,
    aadhaar: '123456789012',
    pan: 'ABCDE1234F',
    dateOfBirth: '1990-01-15',
    placeOfBirth: 'Mumbai',
    currentAddress: '123 Main St, Mumbai',
    permanentAddress: '456 Oak Ave, Delhi',
    isDeleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const createDTO: CreateUserDTO = {
    name: 'John Doe',
    email: 'john@example.com',
    primaryMobile: '9876543210',
    aadhaar: '123456789012',
    pan: 'ABCDE1234F',
    dateOfBirth: '1990-01-15',
    placeOfBirth: 'Mumbai',
    currentAddress: '123 Main St, Mumbai',
    permanentAddress: '456 Oak Ave, Delhi',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
  });

  // ── CREATE ────────────────────────────────────────────

  describe('createUser', () => {
    it('should create a user and return the created record', async () => {
      // First call: INSERT (returns ResultSetHeader)
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // Second call: SELECT (returns the created user)
      mockExecute.mockResolvedValueOnce([[mockUser]]);

      const result = await service.createUser(createDTO);

      expect(result).toEqual(mockUser);
      expect(mockExecute).toHaveBeenCalledTimes(2);

      // Verify INSERT was called with correct params
      const insertCall = mockExecute.mock.calls[0];
      expect(insertCall[0]).toContain('INSERT INTO users');
      expect(insertCall[1]).toContain('test-uuid-1234-5678-9012');
      expect(insertCall[1]).toContain('john@example.com');
    });

    it('should pass secondaryMobile as null when not provided', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      mockExecute.mockResolvedValueOnce([[mockUser]]);

      await service.createUser(createDTO);

      const insertParams = mockExecute.mock.calls[0][1];
      // secondaryMobile is at index 4 in the values array
      expect(insertParams[4]).toBeNull();
    });

    it('should throw an error when user creation fails', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      mockExecute.mockResolvedValueOnce([[]]);  // Empty result = not found

      await expect(service.createUser(createDTO)).rejects.toThrow('Failed to create user');
    });
  });

  // ── UPDATE ────────────────────────────────────────────

  describe('updateUser', () => {
    it('should update a user with partial data', async () => {
      const updateDTO: UpdateUserDTO = { name: 'Jane Doe' };
      const updatedUser = { ...mockUser, name: 'Jane Doe' };

      // getUserById (existence check)
      mockExecute.mockResolvedValueOnce([[mockUser]]);
      // UPDATE query
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // getUserById (return updated)
      mockExecute.mockResolvedValueOnce([[updatedUser]]);

      const result = await service.updateUser('test-uuid-1234-5678-9012', updateDTO);

      expect(result.name).toBe('Jane Doe');
      expect(mockExecute).toHaveBeenCalledTimes(3);
    });

    it('should throw 404 when updating a non-existent user', async () => {
      mockExecute.mockResolvedValueOnce([[]]);  // User not found

      await expect(
        service.updateUser('non-existent-id', { name: 'Test' })
      ).rejects.toThrow('User not found');
    });

    it('should throw 400 when no fields are provided for update', async () => {
      mockExecute.mockResolvedValueOnce([[mockUser]]);

      await expect(
        service.updateUser('test-uuid-1234-5678-9012', {})
      ).rejects.toThrow('No fields to update');
    });
  });

  // ── GET ALL (PAGINATED) ───────────────────────────────

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      // COUNT query
      mockExecute.mockResolvedValueOnce([[{ total: 25 }]]);
      // SELECT query
      mockExecute.mockResolvedValueOnce([[mockUser]]);

      const result = await service.getAllUsers(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.totalItems).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    it('should apply search filter when provided', async () => {
      mockExecute.mockResolvedValueOnce([[{ total: 1 }]]);
      mockExecute.mockResolvedValueOnce([[mockUser]]);

      await service.getAllUsers(1, 10, 'John');

      // Verify the COUNT query includes LIKE clause
      const countCall = mockExecute.mock.calls[0];
      expect(countCall[0]).toContain('LIKE');
      expect(countCall[1]).toContain('%John%');
    });

    it('should calculate pagination metadata correctly for last page', async () => {
      mockExecute.mockResolvedValueOnce([[{ total: 15 }]]);
      mockExecute.mockResolvedValueOnce([[mockUser]]);

      const result = await service.getAllUsers(2, 10);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });
  });

  // ── GET BY ID ─────────────────────────────────────────

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      mockExecute.mockResolvedValueOnce([[mockUser]]);

      const result = await service.getUserById('test-uuid-1234-5678-9012');

      expect(result).toEqual(mockUser);
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        ['test-uuid-1234-5678-9012']
      );
    });

    it('should return null when user not found', async () => {
      mockExecute.mockResolvedValueOnce([[]]);

      const result = await service.getUserById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  // ── DELETE (SOFT) ─────────────────────────────────────

  describe('deleteUser', () => {
    it('should soft-delete a user', async () => {
      // getUserById check
      mockExecute.mockResolvedValueOnce([[mockUser]]);
      // UPDATE isDeleted
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await service.deleteUser('test-uuid-1234-5678-9012');

      // Verify UPDATE SET isDeleted = TRUE was called
      const updateCall = mockExecute.mock.calls[1];
      expect(updateCall[0]).toContain('isDeleted = TRUE');
    });

    it('should throw 404 when deleting a non-existent user', async () => {
      mockExecute.mockResolvedValueOnce([[]]);

      await expect(
        service.deleteUser('non-existent-id')
      ).rejects.toThrow('User not found');
    });
  });
});
