const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Role } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this';

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name, email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'email and password required' });

      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ error: 'email exists' });

      const hash = await bcrypt.hash(password, 10);
      // default role: citizen (ensure seeded role exists in production)
      const citizenRole = await Role.findOne({ where: { name: 'citizen' } });
      const role_id = citizenRole ? citizenRole.id : null;

      const user = await User.create({ name, email, password_hash: hash, role_id });

      const token = jwt.sign({ id: user.id, role_id: user.role_id, role: user.role ? user.role.name : null }, JWT_SECRET, { expiresIn: '8h' });
      res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: 'citizen' } }); // default is citizen
    } catch (err) {
      console.error('Registration Error:', err); // Added debug log
      res.status(500).json({ error: 'server error' });
    }
  });

router.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'email and password required' });

      const user = await User.findOne({
        where: { email },
        include: [{ model: Role, as: 'role' }]
      });
      if (!user) return res.status(401).json({ error: 'invalid credentials' });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'invalid credentials' });

      const roleName = user.role ? user.role.name : 'citizen';
      const token = jwt.sign({ id: user.id, role_id: user.role_id, role: roleName }, JWT_SECRET, { expiresIn: '8h' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: roleName, points: user.points, rank: user.rank } });
    } catch (err) {
      console.error('Login Error:', err); // Added debug log
      res.status(500).json({ error: 'server error' });
    }
  });

const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'points', 'rank'],
      include: [{ model: Role, as: 'role' }]
    });
    if (!user) return res.status(404).json({ error: 'not found' });

    // Flatten role
    const userData = user.toJSON();
    userData.role = user.role ? user.role.name : 'citizen';
    delete userData.role;
    // actually easier to just return user and let frontend handle it, but for consistency:

    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
