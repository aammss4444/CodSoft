const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_enterprise_key_2026';

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id, email, role, and optionally instituteId or athleteId
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Middleware to require specific roles
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to access this resource.' });
    }
    next();
  };
};

/**
 * Middleware to ensure the authenticated user owns or has rights to the specific resource.
 * @param {Function} resourceLoader - A function(req, db) that returns the owning instituteId or athleteId of the resource.
 */
const authorizeOwnership = (resourceLoader) => {
  return async (req, res, next) => {
    try {
      const resourceOwnerId = await resourceLoader(req, require('../db/db'));
      
      if (!resourceOwnerId) {
        return res.status(404).json({ success: false, message: 'Resource not found.' });
      }

      if (req.user.role === 'institute') {
        if (resourceOwnerId !== req.user.instituteId) {
          return res.status(403).json({ success: false, message: 'Forbidden. This resource belongs to another institute.' });
        }
      } else if (req.user.role === 'athlete') {
        if (resourceOwnerId !== req.user.athleteId) {
          return res.status(403).json({ success: false, message: 'Forbidden. This resource belongs to another athlete.' });
        }
      } else if (req.user.role === 'system_admin') {
        // System admin can access anything
      } else {
        return res.status(403).json({ success: false, message: 'Forbidden. Invalid role for ownership check.' });
      }

      next();
    } catch (error) {
      console.error('Ownership authorization error:', error);
      res.status(500).json({ success: false, message: 'Server error during authorization.' });
    }
  };
};

module.exports = { authenticate, authorize, authorizeOwnership, JWT_SECRET };
