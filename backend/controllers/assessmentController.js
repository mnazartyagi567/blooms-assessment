// backend/controllers/assessmentController.js
const assessmentModel = require('../models/assessment');

exports.createAssessment = (req, res) => {
  const { name, date, course_id } = req.body;
  if (!name) return res.status(400).json({ error: "Assessment name is required." });
  assessmentModel.create(name, date, course_id, (err, id) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Assessment created", id });
  });
};

exports.getAllAssessments = (req, res) => {
  assessmentModel.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ assessments: rows });
  });
};

exports.addQuestion = (req, res) => {
  const { assessment_id, question_id } = req.body;
  if (!assessment_id || !question_id) {
    return res.status(400).json({ error: "assessment_id and question_id are required." });
  }
  assessmentModel.addQuestionToAssessment(assessment_id, question_id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Question added to assessment" });
  });
};

exports.getAssessmentQuestions = (req, res) => {
  const { id } = req.params;
  assessmentModel.getAssessmentQuestions(id, (err, questions) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ questions });
  });
};
