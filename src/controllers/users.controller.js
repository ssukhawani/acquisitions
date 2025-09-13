import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service.js';
import { formatValidationError } from '#utils/format.js';
import {
  userIdSchema,
  updateUserSchema,
  queryParamsSchema,
} from '#validations/users.validations.js';

export const getUsers = async (req, res, next) => {
  try {
    const queryValidationResult = queryParamsSchema.safeParse(req.query);

    if (!queryValidationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(queryValidationResult.error),
      });
    }

    const users = await getAllUsers();

    logger.info('Retrieved all users successfully');
    res.status(200).json({
      message: 'Users retrieved successfully',
      users,
      count: users.length,
    });
  } catch (error) {
    logger.error('Error retrieving users:', error);
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const paramValidationResult = userIdSchema.safeParse(req.params);

    if (!paramValidationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramValidationResult.error),
      });
    }

    const { id } = paramValidationResult.data;
    const user = await getUserByIdService(id);

    logger.info(`Retrieved user with ID: ${id}`);
    res.status(200).json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    logger.error('Error retrieving user by ID:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    if (error.message === 'Invalid user ID provided') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid user ID provided',
      });
    }

    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // Validate request parameters
    const paramValidationResult = userIdSchema.safeParse(req.params);
    if (!paramValidationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramValidationResult.error),
      });
    }

    // Validate request body
    const bodyValidationResult = updateUserSchema.safeParse(req.body);
    if (!bodyValidationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidationResult.error),
      });
    }

    const { id } = paramValidationResult.data;
    const updates = bodyValidationResult.data;
    const currentUser = req.user;

    // Check authorization: users can only update their own info, admins can update anyone
    if (currentUser.role !== 'admin' && parseInt(id) !== currentUser.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Check if user is trying to change role - only admins can do this
    if (updates.role && currentUser.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can change user roles',
      });
    }

    // If non-admin is updating themselves, remove role from updates (safety check)
    if (currentUser.role !== 'admin' && parseInt(id) === currentUser.id) {
      delete updates.role;
    }

    const updatedUser = await updateUserService(id, updates);

    logger.info(
      `User updated successfully - ID: ${id}, by user: ${currentUser.email}`
    );
    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Error updating user:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    if (error.message === 'Invalid user ID provided') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid user ID provided',
      });
    }

    if (error.message === 'Email already exists') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already exists',
      });
    }

    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const paramValidationResult = userIdSchema.safeParse(req.params);

    if (!paramValidationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramValidationResult.error),
      });
    }

    const { id } = paramValidationResult.data;
    const currentUser = req.user;

    // Check authorization: users can only delete their own account, admins can delete anyone
    if (currentUser.role !== 'admin' && parseInt(id) !== currentUser.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    // Prevent users from deleting themselves (optional business logic)
    // Uncomment this if you want to prevent self-deletion
    // if (parseInt(id) === currentUser.id) {
    //   return res.status(400).json({
    //     error: 'Bad request',
    //     message: 'You cannot delete your own account'
    //   });
    // }

    const deletedUser = await deleteUserService(id);

    logger.info(
      `User deleted successfully - ID: ${id} (${deletedUser.email}), by user: ${currentUser.email}`
    );
    res.status(200).json({
      message: 'User deleted successfully',
      user: {
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role,
      },
    });
  } catch (error) {
    logger.error('Error deleting user:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
      });
    }

    if (error.message === 'Invalid user ID provided') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid user ID provided',
      });
    }

    next(error);
  }
};
