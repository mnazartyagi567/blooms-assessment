// backend/controllers/assessmentController.js
const model = require('../models/assessment');

exports.createAssessment = (req, res) => {
  const { name, date, course_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required.' });
  model.create(name, date, course_id, (err, id) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id });
  });
};

exports.getAllAssessments = (req, res) => {
  model.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ assessments: rows });
  });
};

exports.addQuestion = (req, res) => {
  const assessment_id = Number(req.params.id);
  const { question_id, max_score } = req.body;
  if (!assessment_id || !question_id || max_score == null) {
    return res.status(400).json({ error: 'assessment_id, question_id & max_score required.' });
  }
  model.addQuestionToAssessment(
    assessment_id, question_id, max_score,
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
};

exports.getAssessmentQuestions = (req, res) => {
  const assessment_id = Number(req.params.id);
  model.getAssessmentQuestions(
    assessment_id,
    (err, questions) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ questions });
    }
  );
};
