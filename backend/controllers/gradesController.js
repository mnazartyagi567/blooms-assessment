// backend/controllers/gradesController.js
const db = require('../config/db')

// Fetch existing aggregated counts for one question
exports.getGrades = (req, res) => {
  const { assessmentId, questionId } = req.params
  const sql = `
    SELECT grade_a_count, grade_b_count, grade_c_count, grade_d_count, total_appeared
      FROM question_grades
     WHERE assessment_id = ? AND question_id = ?
  `
  db.get(sql, [assessmentId, questionId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message })
    // if no row yet, return zeros
    const data = row || {
      grade_a_count: 0,
      grade_b_count: 0,
      grade_c_count: 0,
      grade_d_count: 0,
      total_appeared: 0
    }
    res.json({ grades: data })
  })
}

// Upsert the counts
exports.saveGrades = (req, res) => {
  const {
    assessment_id,
    question_id,
    grade_a_count,
    grade_b_count,
    grade_c_count,
    grade_d_count,
    total_appeared
  } = req.body

  const sql = `
    INSERT INTO question_grades
      (assessment_id, question_id, grade_a_count, grade_b_count, grade_c_count, grade_d_count, total_appeared)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(assessment_id, question_id) DO UPDATE SET
      grade_a_count   = excluded.grade_a_count,
      grade_b_count   = excluded.grade_b_count,
      grade_c_count   = excluded.grade_c_count,
      grade_d_count   = excluded.grade_d_count,
      total_appeared  = excluded.total_appeared
  `
  db.run(
    sql,
    [
      assessment_id,
      question_id,
      grade_a_count,
      grade_b_count,
      grade_c_count,
      grade_d_count,
      total_appeared
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ saved: true })
    }
  )
}
