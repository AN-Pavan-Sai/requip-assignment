import { Router } from 'express';
import {
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
} from '../controllers/user.controller';
import {
  createUserValidation,
  updateUserValidation,
  idParamValidation,
  paginationValidation,
} from '../middleware/validator';

const router = Router();

/**
 * User Routes
 *
 * POST   /api/users      — Create a new user
 * GET    /api/users      — Get all users (paginated, searchable)
 * GET    /api/users/:id  — Get a single user by ID
 * PUT    /api/users/:id  — Update a user
 * DELETE /api/users/:id  — Soft-delete a user
 */

router.post('/', createUserValidation, createUser);
router.get('/', paginationValidation, getAllUsers);
router.get('/:id', idParamValidation, getUserById);
router.put('/:id', updateUserValidation, updateUser);
router.delete('/:id', idParamValidation, deleteUser);

export default router;
