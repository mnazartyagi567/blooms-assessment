// backend/controllers/reportController.js
const gradeModel = require('../models/grade');
const attemptModel = require('../models/attempt');

// Aggregated A/B/C/D report
exports.getAssessmentReport = (req, res) => {
  const { assessmentId } = req.params;
  gradeModel.getGradesForAssessment(assessmentId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Summarize by Bloom's level
    const summary = {};
    rows.forEach((r) => {
      const level = r.level || "Unknown";
      if (!summary[level]) {
        summary[level] = { a: 0, b: 0, c: 0, d: 0, total: 0 };
      }
      summary[level].a += r.grade_a_count;
      summary[level].b += r.grade_b_count;
      summary[level].c += r.grade_c_count;
      summary[level].d += r.grade_d_count;
      summary[level].total += r.total_appeared;
    });

    res.json({ data: rows, summary });
  });
};

// Individual student bloom report
exports.getStudentBloomReport = (req, res) => {
  const { studentId, assessmentId } = req.params;
  attemptModel.getAttemptsForStudentAssessment(studentId, assessmentId, (err, attempts) => {
    if (err) return res.status(500).json({ error: err.message });

    // levelSummary: { [level]: { correct: 0, total: 0 } }
    const levelSummary = {};
    attempts.forEach((a) => {
      const lvl = a.level || 'Unknown';
      if (!levelSummary[lvl]) {
        levelSummary[lvl] = { correct: 0, total: 0 };
      }
      levelSummary[lvl].total += 1;
      if (a.is_correct) {
        levelSummary[lvl].correct += 1;
      }
    });

    res.json({ levelSummary });
  });
};
