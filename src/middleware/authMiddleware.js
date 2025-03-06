const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  // Get token from the header
  const token = req.header('Authorization');

  // Check if token exists
  if (!token) {
    logger.warn('Authorization denied, token not provided');
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user ID to the request object
    req.user = decoded.user;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    logger.warn('Invalid token');
    return res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
