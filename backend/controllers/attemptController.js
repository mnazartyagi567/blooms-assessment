// backend/controllers/attemptController.js
const attemptModel = require('../models/attempt');

exports.saveAttempt = (req, res) => {
  // { student_id, assessment_id, question_id, is_correct }
  attemptModel.saveAttempt(req.body, (err, lastID) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Attempt recorded', id: lastID });
  });
};

exports.getStudentAssessmentAttempts = (req, res) => {
  const { studentId, assessmentId } = req.params;
  attemptModel.getAttemptsForStudentAssessment(studentId, assessmentId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ attempts: rows });
  });
};
