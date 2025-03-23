// backend/models/assessment.js
const db = require('../config/db');

exports.create = (name, date, course_id, callback) => {
  const sql = `INSERT INTO assessments (name, date, course_id) VALUES (?, ?, ?)`;
  db.run(sql, [name, date || "", course_id || null], function (err) {
    callback(err, this?.lastID);
  });
};

exports.getAll = (callback) => {
  const sql = `
    SELECT a.*, c.name as course_name
    FROM assessments a
    LEFT JOIN courses c ON a.course_id = c.id
  `;
  db.all(sql, [], callback);
};

exports.addQuestionToAssessment = (assessment_id, question_id, callback) => {
  const sql = `INSERT INTO assessment_questions (assessment_id, question_id) VALUES (?, ?)`;
  db.run(sql, [assessment_id, question_id], function (err) {
    callback(err, this?.lastID);
  });
};

exports.getAssessmentQuestions = (assessment_id, callback) => {
  const sql = `
    SELECT q.* 
    FROM assessment_questions aq
    JOIN questions q ON aq.question_id = q.id
    WHERE aq.assessment_id = ?
  `;
  db.all(sql, [assessment_id], callback);
};
