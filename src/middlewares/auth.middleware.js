import logger from '#config/logger.js';
import { jwtToken } from '#utils/jwt.js';

export const authenticateUser = (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token is required',
      });
    }

    const decoded = jwtToken.verify(token);
    req.user = decoded;
    logger.info(`User ${decoded.email} authenticated successfully`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    logger.error('Authorization error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authorization check failed',
    });
  }
};

export const requireSelfOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const targetUserId = parseInt(req.params.id);
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && targetUserId !== currentUserId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own information',
      });
    }

    next();
  } catch (error) {
    logger.error('Authorization error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authorization check failed',
    });
  }
};
