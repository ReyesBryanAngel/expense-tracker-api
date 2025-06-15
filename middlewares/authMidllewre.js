const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.sendStatus(403);
    }

    req.user = { id: user._id, email: user.email };
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

module.exports = authenticateToken;
