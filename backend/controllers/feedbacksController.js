// backend/controllers/feedbacksController.js
const Feedback = require('../models/feedback');

exports.getAssessmentFeedback = (req, res) => {
  const a = Number(req.params.assessmentId);
  Feedback.getFeedback(a, null, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ feedback: row?.feedback || null });
  });
};

exports.saveAssessmentFeedback = (req, res) => {
  const a = Number(req.params.assessmentId);
  const fb = (req.body.feedback || '').trim();
  if (!fb) return res.status(400).json({ error: 'Feedback required' });
  Feedback.upsertFeedback(a, null, fb, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

exports.deleteAssessmentFeedback = (req, res) => {
  const a = Number(req.params.assessmentId);
  Feedback.deleteFeedback(a, null, err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

exports.getStudentFeedback = (req, res) => {
  const s = Number(req.params.studentId);
  const a = Number(req.params.assessmentId);
  Feedback.getFeedback(a, s, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ feedback: row?.feedback || null });
  });
};

exports.saveStudentFeedback = (req, res) => {
  const s  = Number(req.params.studentId);
  const a  = Number(req.params.assessmentId);
  const fb = (req.body.feedback || '').trim();
  if (!fb) return res.status(400).json({ error: 'Feedback required' });
  Feedback.upsertFeedback(a, s, fb, err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

exports.deleteStudentFeedback = (req, res) => {
  const s = Number(req.params.studentId);
  const a = Number(req.params.assessmentId);
  Feedback.deleteFeedback(a, s, err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};
