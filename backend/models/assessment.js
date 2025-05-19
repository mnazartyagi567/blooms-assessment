// backend/models/assessment.js
const db = require('../config/db');

exports.create = (name, date, course_id, cb) => {
  const sql = `
    INSERT INTO assessments (name, date, course_id)
      VALUES ($1, $2, $3)
  `;
  db.run(sql, [name, date, course_id], function(err) {
    cb(err, this.lastID);
  });
};

exports.getAll = cb => {
  db.all(`
    SELECT a.*, c.name AS course_name
      FROM assessments a
      LEFT JOIN courses c ON c.id = a.course_id
    ORDER BY a.date DESC
  `, cb);
};

exports.addQuestionToAssessment = (assessment_id, question_id, max_score, cb) => {
  const sql = `
    INSERT INTO assessment_questions
      (assessment_id, question_id, max_score)
    VALUES ($1, $2, $3)
  `;
  db.run(sql, [assessment_id, question_id, max_score], cb);
};

exports.getAssessmentQuestions = (assessment_id, cb) => {
  const sql = `
    SELECT
      aq.id           AS aq_id,
      q.id            AS id,
      q.question_no,
      q.question_text,
      q.level,
      q.keywords,
      q.specification,
      aq.max_score
    FROM assessment_questions aq
    JOIN questions q ON q.id = aq.question_id
    WHERE aq.assessment_id = $1
    ORDER BY q.question_no
  `;
  db.all(sql, [assessment_id], cb);
};

exports.removeQuestionFromAssessment = (aq_id, cb) => {
  // 1) look up which assessment/question this mapping is
  const findSql = `
    SELECT assessment_id, question_id
      FROM assessment_questions
     WHERE id = $1
  `
  db.get(findSql, [aq_id], (err, row) => {
    if (err) return cb(err)
    if (!row) return cb(new Error('Mapping not found'))

    const { assessment_id, question_id } = row

    // 2) DELETE any student scores for that mapping
    //    → use db.all so it doesn't append RETURNING or require rows[0]
    const delScoresSql = `
      DELETE FROM student_assessment_attempts
       WHERE assessment_id = $1
         AND question_id   = $2
    `
    db.all(delScoresSql, [assessment_id, question_id], (err2/*, rows*/) => {
      if (err2) return cb(err2)

      // 3) now delete the mapping itself, using your run() wrapper
      //    it'll append RETURNING id so you'll always get a row back
      const delAqSql = `
        DELETE FROM assessment_questions
         WHERE id = $1
      `
      db.run(delAqSql, [aq_id], cb)
    })
  })
}