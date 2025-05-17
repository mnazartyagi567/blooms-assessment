// backend/models/questions.js
const db = require('../config/db');

exports.create = (data, callback) => {
  const {
    question_no,
    question_text,
    level,
    keywords,
    specification,
    co,
    po
  } = data;

  const sql = `
    INSERT INTO questions
      (question_no, question_text, level, keywords, specification, co, po)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  db.run(
    sql,
    [
      question_no,
      question_text,
      level,
      keywords,
      specification,
      co,
      po
    ],
    function (err) {
      callback(err, this?.lastID);
    }
  );
};

exports.getAll = (callback) => {
  db.all(`SELECT * FROM questions ORDER BY question_no`, [], callback);
};
