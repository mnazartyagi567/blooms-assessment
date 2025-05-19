// backend/controllers/reportsController.js
const db = require('../config/db')

/**
 * Returns per-question attainment counts for one assessment.
 */
exports.getAttainmentReport = (req, res) => {
  const { assessmentId } = req.params

  const sql = `
    SELECT
      q.level AS level,
      SUM(CASE 
            WHEN saa.score * 1.0 / aq.max_score >= 0.81 THEN 1 
            ELSE 0 
          END) AS excellent,
      SUM(CASE 
            WHEN saa.score * 1.0 / aq.max_score >= 0.71 
             AND saa.score * 1.0 / aq.max_score < 0.81 THEN 1 
            ELSE 0 
          END) AS very_good,
      SUM(CASE 
            WHEN saa.score * 1.0 / aq.max_score >= 0.61 
             AND saa.score * 1.0 / aq.max_score < 0.71 THEN 1 
            ELSE 0 
          END) AS good,
      SUM(CASE 
            WHEN saa.score * 1.0 / aq.max_score >= 0.51 
             AND saa.score * 1.0 / aq.max_score < 0.61 THEN 1 
            ELSE 0 
          END) AS satisfactory,
      SUM(CASE 
            WHEN saa.score * 1.0 / aq.max_score < 0.51 THEN 1 
            ELSE 0 
          END) AS not_satisfactory,
      COUNT(*) AS total
    FROM student_assessment_attempts AS saa
    JOIN assessment_questions AS aq
      ON aq.assessment_id = saa.assessment_id
     AND aq.question_id   = saa.question_id
    JOIN questions AS q
      ON q.id = saa.question_id
    WHERE saa.assessment_id = $1
    GROUP BY q.level
    ORDER BY
      CASE q.level
        WHEN 'Remembering'   THEN 1
        WHEN 'Understanding' THEN 2
        WHEN 'Applying'      THEN 3
        WHEN 'Analyzing'     THEN 4
        WHEN 'Evaluating'    THEN 5
        WHEN 'Creating'      THEN 6
        ELSE 99
      END
  `

  db.all(sql, [assessmentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ attainment: rows })
  })
}

exports.getAssessmentResults = (req, res) => {
  const { assessmentId } = req.params;
  const sql = `
    SELECT
      s.name            AS student,
      q.question_no     AS question_no,
      q.level           AS level,
      saa.score         AS obtained,
      aq.max_score      AS max_score
    FROM student_assessment_attempts AS saa

    -- bring in the join table so we can grab max_score
    JOIN assessment_questions AS aq
      ON aq.assessment_id = saa.assessment_id
     AND aq.question_id   = saa.question_id

    -- then bring in the master question for the question_no & level
    JOIN questions AS q
      ON q.id = saa.question_id

    -- and of course the student name
    JOIN students AS s
      ON s.id = saa.student_id

    WHERE saa.assessment_id = $1
    ORDER BY s.name, q.question_no
  `;

  db.all(sql, [assessmentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ details: rows });
  });
};
