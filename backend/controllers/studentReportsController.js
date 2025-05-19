const db = require('../config/db')

exports.getStudentAssessmentReport = (req, res) => {
  const { studentId, assessmentId } = req.params

  // 1) level summary
  const levelSql = `
    SELECT
      q.level,
      AVG(CAST(saa.score AS FLOAT)/aq.max_score * 100) AS avg_pct,
      COUNT(*)                                  AS num_questions
    FROM student_assessment_attempts saa
    JOIN assessment_questions       aq
      ON aq.assessment_id = saa.assessment_id
     AND aq.question_id   = saa.question_id
    JOIN questions                  q
      ON q.id = saa.question_id
    WHERE saa.student_id    = $1
      AND saa.assessment_id = $2
    GROUP BY q.level
  `

  // 2) per-question details
  const detailSql = `
    SELECT
      q.question_no,
      q.level,
      ROUND(saa.score::float / aq.max_score * 100) AS pct
    FROM student_assessment_attempts saa
    JOIN assessment_questions aq
      ON aq.assessment_id = saa.assessment_id
     AND aq.question_id   = saa.question_id
    JOIN questions q
      ON q.id = saa.question_id
    WHERE saa.student_id    = $1
      AND saa.assessment_id = $2
    ORDER BY q.question_no::int
  `

  db.all(levelSql, [studentId, assessmentId], (err, lvlRows) => {
    if (err) return res.status(500).json({ error: err.message })

    const levelSummary = {
      Remembering:   null,
      Understanding: null,
      Applying:      null,
      Analyzing:     null,
      Evaluating:    null,
      Creating:      null
    }
    lvlRows.forEach(r => {
      levelSummary[r.level] = {
        avg: Math.round(r.avg_pct),
        count: r.num_questions
      }
    })

    db.all(detailSql, [studentId, assessmentId], (err2, details) => {
      if (err2) return res.status(500).json({ error: err2.message })

      // 3) student & assessment info as before
      db.get(
        `SELECT name, program AS programme, semester, academic_year AS course
           FROM students WHERE id = $1`,
        [studentId],
        (err3, student) => {
          if (err3) return res.status(500).json({ error: err3.message })

          db.get(
            `SELECT a.name, a.date, c.name AS course_name
               FROM assessments a
               LEFT JOIN courses c ON c.id = a.course_id
              WHERE a.id = $1`,
            [assessmentId],
            (err4, asmt) => {
              if (err4) return res.status(500).json({ error: err4.message })

              res.json({
                student:       student  || {},
                assessment:    asmt     || {},
                levelSummary,
                details
              })
            }
          )
        }
      )
    })
  })
}
