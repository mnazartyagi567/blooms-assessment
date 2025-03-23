// backend/models/question.js
const db = require('../config/db');

exports.getAll = (callback) => {
  const sql = `SELECT * FROM questions`;
  db.all(sql, [], (err, rows) => {
    callback(err, rows);
  });
};

exports.create = (data, callback) => {
  const { question_no, level, keywords, specification } = data;
  const sql = `INSERT INTO questions (question_no, level, keywords, specification) VALUES (?, ?, ?, ?)`;
  db.run(sql, [question_no, level, keywords, specification], function(err) {
    callback(err, this.lastID);
  });
};
