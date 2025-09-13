import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#controllers/users.controller.js';
import {
  authenticateUser,
  requireAdmin,
  requireSelfOrAdmin,
} from '#middlewares/auth.middleware.js';
import express from 'express';

const router = express.Router();

// Get all users - Admin only
router.get('/', authenticateUser, requireAdmin, getUsers);

// Get user by ID - User can get their own, Admin can get anyone's
router.get('/:id', authenticateUser, requireSelfOrAdmin, getUserById);

// Update user - User can update their own, Admin can update anyone's
// Additional role-based checks are handled in the controller
router.put('/:id', authenticateUser, requireSelfOrAdmin, updateUser);

// Delete user - User can delete their own account, Admin can delete anyone's
router.delete('/:id', authenticateUser, requireSelfOrAdmin, deleteUser);

export default router;
