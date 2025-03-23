// backend/models/student.js
const db = require('../config/db');

exports.create = (data, callback) => {
  const { name, roll_no, program, semester, academic_year } = data;
  const sql = `
    INSERT INTO students (name, roll_no, program, semester, academic_year)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [name, roll_no, program, semester, academic_year], function (err) {
    callback(err, this?.lastID);
  });
};

exports.getAll = (callback) => {
  db.all(`SELECT * FROM students`, [], callback);
};
