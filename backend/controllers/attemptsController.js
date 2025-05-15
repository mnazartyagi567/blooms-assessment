// backend/controllers/attemptsController.js
const db = require('../config/db');

// record or update a student's score on one question
exports.recordAttempt = (req, res) => {
  const { student_id, assessment_id, question_id, score } = req.body;
  const sql = `
    INSERT INTO student_assessment_attempts
      (student_id, assessment_id, question_id, score)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(student_id, assessment_id, question_id) DO UPDATE SET
      score = excluded.score
  `;
  db.run(sql, [student_id, assessment_id, question_id, score], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

// class-level summary: sum of scores & count per Bloom level
exports.getClassReport = (req, res) => {
  const { assessmentId } = req.params;
  const sql = `
    SELECT
      q.level,
      SUM(saa.score) AS total_score,
      COUNT(*)       AS attempts
    FROM student_assessment_attempts saa
    JOIN questions q
      ON q.id = saa.question_id
    WHERE saa.assessment_id = ?
    GROUP BY q.level
  `;
  db.all(sql, [assessmentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const summary = {
      Remembering:   { total_score: 0, attempts: 0 },
      Understanding: { total_score: 0, attempts: 0 },
      Applying:      { total_score: 0, attempts: 0 },
      Analyzing:     { total_score: 0, attempts: 0 },
      Evaluating:    { total_score: 0, attempts: 0 },
      Creating:      { total_score: 0, attempts: 0 }
    };

    rows.forEach(r => {
      if (summary[r.level]) {
        summary[r.level] = {
          total_score: r.total_score,
          attempts:    r.attempts
        };
      }
    });

    res.json({ classSummary: summary });
  });
};

// (optional) student-level report
exports.getStudentReport = (req, res) => {
  const { studentId, assessmentId } = req.params;
  const sql = `
    SELECT
      q.level,
      SUM(saa.score) AS total_score,
      COUNT(*)       AS attempts
    FROM student_assessment_attempts saa
    JOIN questions q
      ON q.id = saa.question_id
    WHERE saa.assessment_id = ?
      AND saa.student_id    = ?
    GROUP BY q.level
  `;
  db.all(sql, [assessmentId, studentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const summary = {
      Remembering:   { total_score: 0, attempts: 0 },
      Understanding: { total_score: 0, attempts: 0 },
      Applying:      { total_score: 0, attempts: 0 },
      Analyzing:     { total_score: 0, attempts: 0 },
      Evaluating:    { total_score: 0, attempts: 0 },
      Creating:      { total_score: 0, attempts: 0 }
    };

    rows.forEach(r => {
      if (summary[r.level]) {
        summary[r.level] = {
          total_score: r.total_score,
          attempts:    r.attempts
        };
      }
    });

    res.json({ levelSummary: summary });
  });
};
