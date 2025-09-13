import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';
import { hashPassword } from './auth.service.js';

export const getAllUsers = async () => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);

    logger.info(`Retrieved ${allUsers.length} users`);
    return allUsers;
  } catch (error) {
    logger.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users');
  }
};

export const getUserById = async id => {
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid user ID provided');
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`Retrieved user with ID: ${id}`);
    return user;
  } catch (error) {
    logger.error(`Error fetching user by ID ${id}:`, error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid user ID provided');
    }

    // Check if user exists first
    const existingUser = await getUserById(id);

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    // Add updated_at timestamp
    updates.updated_at = new Date();

    // Check if email is being updated and if it already exists
    if (updates.email) {
      const [emailExists] = await db
        .select()
        .from(users)
        .where(eq(users.email, updates.email))
        .limit(1);

      if (emailExists && emailExists.id !== parseInt(id)) {
        throw new Error('Email already exists');
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    logger.info(`Updated user with ID: ${id}`);
    return updatedUser;
  } catch (error) {
    logger.error(`Error updating user with ID ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid user ID provided');
    }

    // Check if user exists first
    const existingUser = await getUserById(id);

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    if (!deletedUser) {
      throw new Error('Failed to delete user');
    }

    logger.info(`Deleted user with ID: ${id} (${deletedUser.email})`);
    return deletedUser;
  } catch (error) {
    logger.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};
