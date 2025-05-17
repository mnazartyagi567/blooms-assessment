// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE username = $1 AND password = $2`,
    [username, password],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      res.json({ token, role: user.role });
    }
  );
});

module.exports = router;
