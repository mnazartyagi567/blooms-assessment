// backend/models/course.js
const db = require('../config/db');

exports.create = (data, callback) => {
  const { name, code, program, semester, academic_year } = data;
  const sql = `
    INSERT INTO courses (name, code, program, semester, academic_year)
    VALUES ($1, $2, $3, $4, $5)
  `;
  db.run(sql, [name, code, program, semester, academic_year], function (err) {
    callback(err, this?.lastID);
  });
};

exports.getAll = (callback) => {
  db.all(`SELECT * FROM courses`, [], callback);
};
