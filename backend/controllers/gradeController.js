// backend/controllers/gradeController.js
const gradeModel = require('../models/grade');

exports.saveGradeDistribution = (req, res) => {
  const { assessment_id, question_id, grade_a_count, grade_b_count, grade_c_count, grade_d_count, total_appeared } = req.body;
  if (!assessment_id || !question_id) {
    return res.status(400).json({ error: "assessment_id and question_id are required." });
  }

  const data = {
    grade_a_count: grade_a_count || 0,
    grade_b_count: grade_b_count || 0,
    grade_c_count: grade_c_count || 0,
    grade_d_count: grade_d_count || 0,
    total_appeared: total_appeared || 0
  };

  gradeModel.saveGrades(assessment_id, question_id, data, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Grade distribution saved" });
  });
};
