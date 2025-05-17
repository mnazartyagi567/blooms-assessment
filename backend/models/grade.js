// backend/models/grade.js
const db = require('../config/db');

exports.saveGrades = (assessment_id, question_id, data, callback) => {
  const { grade_a_count, grade_b_count, grade_c_count, grade_d_count, total_appeared } = data;

  const checkSql = `
    SELECT id FROM question_grades
    WHERE assessment_id = $1 AND question_id = $2
  `;
  db.get(checkSql, [assessment_id, question_id], (err, row) => {
    if (err) return callback(err);
    if (row) {
      // Update existing
      const updateSql = `
        UPDATE question_grades
        SET grade_a_count = $1, grade_b_count = $2, grade_c_count = $3, grade_d_count = $4, total_appeared = $5
        WHERE id = $6
      `;
      db.run(updateSql, [grade_a_count, grade_b_count, grade_c_count, grade_d_count, total_appeared, row.id], (err2) => {
        callback(err2);
      });
    } else {
      // Insert new
      const insertSql = `
        INSERT INTO question_grades (
          assessment_id, question_id, grade_a_count, grade_b_count, grade_c_count, grade_d_count, total_appeared
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      db.run(insertSql, [assessment_id, question_id, grade_a_count, grade_b_count, grade_c_count, grade_d_count, total_appeared], function (err2) {
        callback(err2);
      });
    }
  });
};

exports.getGradesForAssessment = (assessment_id, callback) => {
  const sql = `
    SELECT qg.*, q.question_no, q.level
    FROM question_grades qg
    JOIN questions q ON qg.question_id = q.id
    WHERE qg.assessment_id = $1
  `;
  db.all(sql, [assessment_id], callback);
};
