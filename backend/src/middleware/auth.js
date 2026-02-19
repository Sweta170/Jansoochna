const jwt = require('jsonwebtoken');
const models = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this';

async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await models.User.findByPk(payload.id, { include: [{ model: models.Role, as: 'role' }] });
    if (!user) return res.status(401).json({ error: 'invalid token' });
    req.user = { id: user.id, role_id: user.role_id, role: user.role ? user.role.name : null, name: user.name, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

function requireRole(allowed = []) {
  // allowed: array of role names (strings). If empty, allow any authenticated user.
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'not authenticated' });
    if (!Array.isArray(allowed) || allowed.length === 0) return next();
    const userRole = req.user.role;
    if (userRole && allowed.includes(userRole)) return next();
    return res.status(403).json({ error: 'forbidden' });
  };
}

module.exports = { authenticate, requireRole };
