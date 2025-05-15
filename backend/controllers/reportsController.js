// backend/controllers/reportsController.js
const db = require('../config/db')

// 1) Class‐level summary by Bloom level
//    sums up total_appeared & correct answers across all questions
exports.getClassSummary = (req, res) => {
  const { assessmentId } = req.params
  const sql = `
    SELECT
      q.level,
      SUM(qg.grade_a_count) + SUM(qg.grade_b_count) + SUM(qg.grade_c_count) + SUM(qg.grade_d_count) AS total_responses,
      SUM(qg.total_appeared) AS total_appeared,
      -- to compute 'correct', assume A & B are 'correct' (customize if needed):
      SUM(qg.grade_a_count + qg.grade_b_count) AS correct_responses
    FROM question_grades qg
    JOIN questions q ON q.id = qg.question_id
    WHERE qg.assessment_id = ?
    GROUP BY q.level
  `
  db.all(sql, [assessmentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })

    // Ensure all levels present
    const levels = [
      'Remembering','Understanding','Applying',
      'Analyzing','Evaluating','Creating'
    ]
    const summary = {}
    levels.forEach(l => summary[l] = { correct:0, appeared:0 })
    rows.forEach(r => {
      summary[r.level] = {
        correct:  r.correct_responses,
        appeared: r.total_appeared
      }
    })
    res.json({ classSummary: summary })
  })
}

// 2) Student‐level summary by Bloom level
//    reuses the logic from attemptsController.getReport
exports.getStudentSummary = (req, res) => {
  const { assessmentId, studentId } = req.params
  const sql = `
    SELECT
      q.level,
      SUM(saa.is_correct) AS correct,
      COUNT(*) AS total
    FROM student_assessment_attempts saa
    JOIN questions q ON q.id = saa.question_id
    WHERE saa.assessment_id = ?
      AND saa.student_id    = ?
    GROUP BY q.level
  `
  db.all(sql, [assessmentId, studentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })

    const levels = [
      'Remembering','Understanding','Applying',
      'Analyzing','Evaluating','Creating'
    ]
    const summary = {}
    levels.forEach(l => summary[l] = { correct:0, total:0 })
    rows.forEach(r => {
      summary[r.level] = { correct: r.correct, total: r.total }
    })
    res.json({ studentSummary: summary })
  })
}
