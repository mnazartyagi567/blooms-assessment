// backend/models/user.js
const db = require('../config/db');

exports.findUser = (username, password, callback) => {
  const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
  db.get(sql, [username, password], callback);
};
