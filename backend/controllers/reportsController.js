// backend/controllers/reportsController.js
const db = require('../config/db')

/**
 * Returns per-question attainment counts for one assessment.
 */
exports.getAttainmentReport = (req, res) => {
  const { assessmentId } = req.params

  const sql = `
    SELECT
      q.level                                  AS level,
      SUM(CASE WHEN saa.score*1.0/aq.max_score >= 0.9 THEN 1 ELSE 0 END) AS excellent,
      SUM(CASE WHEN saa.score*1.0/aq.max_score >= 0.8 
                 AND saa.score*1.0/aq.max_score < 0.9 THEN 1 ELSE 0 END) AS very_good,
      SUM(CASE WHEN saa.score*1.0/aq.max_score >= 0.7 
                 AND saa.score*1.0/aq.max_score < 0.8 THEN 1 ELSE 0 END) AS good,
      SUM(CASE WHEN saa.score*1.0/aq.max_score < 0.7 THEN 1 ELSE 0 END) AS not_satisfactory,
      COUNT(*)                                  AS total
    FROM student_assessment_attempts saa
    JOIN assessment_questions aq
      ON aq.assessment_id = saa.assessment_id
     AND aq.question_id   = saa.question_id
    JOIN questions q
      ON q.id = saa.question_id
    WHERE saa.assessment_id = $1
    GROUP BY q.level
    ORDER BY
      CASE q.level
        WHEN 'Knowing' THEN 1
        WHEN 'Understanding' THEN 2
        WHEN 'Applying' THEN 3
        WHEN 'Analyzing' THEN 4
        WHEN 'Evaluating' THEN 5
        WHEN 'Creating' THEN 6
        ELSE 99
      END
  `

  db.all(sql, [assessmentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ attainment: rows })
  })
}
