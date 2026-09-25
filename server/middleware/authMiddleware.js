const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'skillswap_secret_key_123';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization header missing or invalid format' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication token missing' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists in MongoDB database if connected
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (dbErr) {
      // In case DB query fails or mock user token
    }

    if (!user) {
      // Fallback object if decoded has user data
      req.user = { _id: decoded.id, id: decoded.id, email: decoded.email, name: decoded.name || 'User' };
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
