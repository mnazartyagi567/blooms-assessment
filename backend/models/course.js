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

exports.update = (id, data, cb) => {
  const { name, code, program, semester, academic_year } = data
  const sql = `
    UPDATE courses
       SET name = $1, code = $2, program = $3,
           semester = $4, academic_year = $5
     WHERE id = $6
  `
  db.run(sql,
    [name, code, program, semester, academic_year, id],
    cb
  )
}

exports.delete = (id, callback) => {
  // 1) find all assessments under this course
  db.all(
    `SELECT id FROM assessments WHERE course_id = $1`,
    [id],
    (err, rows) => {
      if (err) return callback(err)
      const asmtIds = rows.map(r => r.id)
      if (asmtIds.length === 0) {
        // no assessments → just delete the course
        return db.run(`DELETE FROM courses WHERE id = $1`, [id], callback)
      }

      // 2) delete all student attempts for those assessments
      db.run(
        `DELETE FROM student_assessment_attempts
           WHERE assessment_id = ANY($1::int[])`,
        [asmtIds],
        err2 => {
          if (err2) return callback(err2)

          // 3) delete all assessment_questions for those assessments
          db.run(
            `DELETE FROM assessment_questions
               WHERE assessment_id = ANY($1::int[])`,
            [asmtIds],
            err3 => {
              if (err3) return callback(err3)

              // 4) delete the assessments themselves
              db.run(
                `DELETE FROM assessments WHERE course_id = $1`,
                [id],
                err4 => {
                  if (err4) return callback(err4)

                  // 5) finally delete the course
                  db.run(`DELETE FROM courses WHERE id = $1`, [id], callback)
                }
              )
            }
          )
        }
      )
    }
  )
}