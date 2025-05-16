// backend/controllers/attemptsController.js
const db = require('../config/db');

// upsert a single student’s question score
exports.recordAttempt = (req, res) => {
  const { student_id, assessment_id, question_id, score } = req.body;
  const sql = `
    INSERT INTO student_assessment_attempts
      (student_id,assessment_id,question_id,score)
    VALUES (?,?,?,?)
    ON CONFLICT(student_id,assessment_id,question_id) 
      DO UPDATE SET score = excluded.score
  `;
  db.run(sql,
    [student_id,assessment_id,question_id,score],
    function(err){
      if (err) return res.status(500).json({ error:err.message });
      res.json({ id:this.lastID });
    }
  );
};

// student‐level report
exports.getStudentReport = (req,res) => {
  const { studentId, assessmentId } = req.params;
  const sql = `
    SELECT q.level,
           SUM(saa.score)   AS total_score,
           COUNT(*)          AS num_questions
      FROM student_assessment_attempts saa
      JOIN questions q ON q.id = saa.question_id
     WHERE saa.student_id    = ?
       AND saa.assessment_id = ?
     GROUP BY q.level
  `;
  db.all(sql,[studentId,assessmentId],(err,rows)=>{
    if (err) return res.status(500).json({ error:err.message });
    const summary = {
      Remembering:   { total_score:0,num_questions:0 },
      Understanding: { total_score:0,num_questions:0 },
      Applying:      { total_score:0,num_questions:0 },
      Analyzing:     { total_score:0,num_questions:0 },
      Evaluating:    { total_score:0,num_questions:0 },
      Creating:      { total_score:0,num_questions:0 }
    };
    rows.forEach(r=>{
      summary[r.level] = {
        total_score:   r.total_score,
        num_questions: r.num_questions
      };
    });
    res.json({ levelSummary: summary });
  });
};

// class‐level report
exports.getClassReport = (req,res) => {
  const { assessmentId } = req.params;
  const sql = `
    SELECT q.level,
           SUM(saa.score)    AS total_score,
           COUNT(*)           AS total_entries
      FROM student_assessment_attempts saa
      JOIN questions q ON q.id = saa.question_id
     WHERE saa.assessment_id = ?
     GROUP BY q.level
  `;
  db.all(sql,[assessmentId],(err,rows)=>{
    if (err) return res.status(500).json({ error:err.message });
    const summary = {
      Remembering:   { total_score:0,total_entries:0 },
      Understanding: { total_score:0,total_entries:0 },
      Applying:      { total_score:0,total_entries:0 },
      Analyzing:     { total_score:0,total_entries:0 },
      Evaluating:    { total_score:0,total_entries:0 },
      Creating:      { total_score:0,total_entries:0 }
    };
    rows.forEach(r=>{
      summary[r.level] = {
        total_score:   r.total_score,
        total_entries: r.total_entries
      };
    });
    res.json({ classSummary: summary });
  });
};
