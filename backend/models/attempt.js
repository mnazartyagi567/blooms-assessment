// backend/models/attempt.js
const db = require('../config/db');

exports.saveAttempt = (data, callback) => {
  const { student_id, assessment_id, question_id, is_correct } = data;
  const sql = `
    INSERT INTO student_assessment_attempts (student_id, assessment_id, question_id, is_correct)
    VALUES ($1, $2, $3, $4)
  `;
  db.run(sql, [student_id, assessment_id, question_id, is_correct], function (err) {
    callback(err, this?.lastID);
  });
};

exports.getAttemptsForStudentAssessment = (student_id, assessment_id, callback) => {
  const sql = `
    SELECT saa.*, q.level, q.question_no
    FROM student_assessment_attempts saa
    JOIN questions q ON saa.question_id = q.id
    WHERE saa.student_id = $1 AND saa.assessment_id = $2
  `;
  db.all(sql, [student_id, assessment_id], callback);
};

exports.getAttemptsForAssessment = (assessment_id, callback) => {
  const sql = `
    SELECT saa.*, q.level, q.question_no, s.name as student_name
    FROM student_assessment_attempts saa
    JOIN questions q ON saa.question_id = q.id
    JOIN students s ON saa.student_id = s.id
    WHERE saa.assessment_id = $1
  `;
  db.all(sql, [assessment_id], callback);
};

exports.getScore = (student_id, assessment_id, question_id, cb) => {
  const sql = `
    SELECT score
      FROM student_assessment_attempts
     WHERE student_id    = $1
       AND assessment_id = $2
       AND question_id   = $3
  `;
  db.get(sql, [student_id, assessment_id, question_id], cb);
};
