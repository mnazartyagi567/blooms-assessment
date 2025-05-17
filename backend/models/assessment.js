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
