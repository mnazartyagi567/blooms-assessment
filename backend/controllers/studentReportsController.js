const db = require('../config/db')

/**
 * Returns, for a given student+assessment, each level's average percentage:
 *   avg_pct = AVG( score / max_score * 100 )
 */
exports.getStudentAssessmentReport = (req, res) => {
    const { studentId, assessmentId } = req.params
  
    // 1) Fetch levelSummary
    const levelSql = `
      SELECT
        q.level AS level,
        AVG(CAST(saa.score AS FLOAT)/aq.max_score * 100)    AS avg_pct,
        COUNT(*)                                           AS num_questions
      FROM student_assessment_attempts AS saa
      JOIN assessment_questions       AS aq
        ON aq.assessment_id = saa.assessment_id
       AND aq.question_id   = saa.question_id
      JOIN questions                  AS q
        ON q.id = saa.question_id
      WHERE saa.student_id    = ?
        AND saa.assessment_id = ?
      GROUP BY q.level
    `
  
    db.all(levelSql, [studentId, assessmentId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
  
      // build the levelSummary with defaults
      const levelSummary = {
        Knowing:       null,
        Understanding: null,
        Applying:      null,
        Analyzing:     null,
        Evaluating:    null,
        Creating:      null
      }
  
      rows.forEach(r => {
        levelSummary[r.level] = {
          avg:   Math.round(r.avg_pct),
          count: r.num_questions
        }
      })
  
      // 2) Fetch student info
      const studentSql = `
        SELECT name, program AS programme, semester, academic_year AS course
        FROM students
        WHERE id = ?
      `
      db.get(studentSql, [studentId], (err2, student) => {
        if (err2) return res.status(500).json({ error: err2.message })
  
        // 3) Fetch assessment info (plus course name if you want)
        const asmtSql = `
          SELECT a.name, a.date, c.name AS course_name
          FROM assessments a
          LEFT JOIN courses c ON c.id = a.course_id
          WHERE a.id = ?
        `
        db.get(asmtSql, [assessmentId], (err3, asmt) => {
          if (err3) return res.status(500).json({ error: err3.message })
  
          // 4) send all three pieces in one object
          res.json({
            student:        student      || {},
            assessment:     asmt         || {},
            levelSummary
          })
        })
      })
    })
  }
