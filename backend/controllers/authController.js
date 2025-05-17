// backend/controllers/authController.js
const db = require('../config/db');

exports.login = (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const sql = `SELECT * FROM users WHERE username = $1 AND password = $2`;
  db.get(sql, [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error.' });
    }
    if (row) {
      // In a real app, generate a token or session here.
      res.json({ message: 'Login successful', user: row });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
};
