// backend/models/user.js
const db = require('../config/db');

exports.findUser = (username, password, callback) => {
  const sql = `SELECT * FROM users WHERE username = $1 AND password = $2`;
  db.get(sql, [username, password], callback);
};
