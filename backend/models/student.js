// backend/models/student.js
const db = require('../config/db');

exports.create = (data, callback) => {
  const { name, roll_no, program, semester, academic_year } = data;
  const sql = `
    INSERT INTO students (name, roll_no, program, semester, academic_year)
    VALUES ($1, $2, $3, $4, $5)
  `;
  db.run(sql, [name, roll_no, program, semester, academic_year], function (err) {
    callback(err, this?.lastID);
  });
};

exports.getAll = (callback) => {
  db.all(`SELECT * FROM students`, [], callback);
};

exports.update = (id, data, cb) => {
  const { name, roll_no, program, semester, academic_year } = data
  const sql = `
    UPDATE students
       SET name=$1, roll_no=$2, program=$3, semester=$4, academic_year=$5
     WHERE id = $6
  `
  db.run(sql,
    [name, roll_no, program, semester, academic_year, id],
    cb
  )
}

exports.delete = (id, cb) => {
  // 1) delete attempts
  db.run(
    `DELETE FROM student_assessment_attempts WHERE student_id = $1`,
    [id],
    err => {
      if (err) return cb(err)
      // 2) delete student
      db.run(
        `DELETE FROM students WHERE id = $1`,
        [id],
        cb
      )
    }
  )
}

