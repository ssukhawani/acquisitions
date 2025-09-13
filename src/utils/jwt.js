import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

const JWT_EXPIRATION = '1d';

export const jwtToken = {
  sign: payload => {
    try {
      return jwt.sign(payload, SECRET_KEY, { expiresIn: JWT_EXPIRATION });
    } catch (error) {
      logger.error('Error signing JWT:', error);
      throw new Error('Could not sign the token');
    }
  },
  verify: token => {
    try {
      return jwt.verify(token, SECRET_KEY);
    } catch (error) {
      logger.error('Error verifying JWT:', error);
      throw new Error('Invalid token');
    }
  },
};
