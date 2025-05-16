// backend/index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
// (Reuse your existing route files for questions, assessments, etc.)
const questionRoutes = require('./routes/questions');
const assessmentRoutes = require('./routes/assessments');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const attemptRoutes = require('./routes/attempts');
const reportRoutes = require('./routes/reports')
const studentReportRoutes = require('./routes/studentReport')

const { authenticate, authorize } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve React
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Public auth
app.use('/api/auth', authRoutes);
app.use('/api/reports/student', authenticate, authorize(['teacher']),  studentReportRoutes)

app.use('/api/attempts', authenticate, authorize(['teacher']), attemptRoutes);
app.use('/api/reports', authenticate, authorize(['teacher']),  reportRoutes);



// Teacher‐only
app.use('/api/questions', authenticate, authorize(['teacher']), questionRoutes);
app.use(
  '/api/assessments',
  authenticate,
  authorize(['teacher']),
  assessmentRoutes
);
// app.use('/api/grades', authenticate, authorize(['teacher']), gradeRoutes);
app.use('/api/students', authenticate, authorize(['teacher']), studentRoutes);
app.use('/api/courses', authenticate, authorize(['teacher']), courseRoutes);

// Student attempts & teacher can read them both
app.use('/api/attempts', authenticate, attemptRoutes);

// Student‐only final summary
app.get(
  '/api/results/final',
  authenticate,
  authorize(['student']),
  (req, res) => {
    const db = require('./config/db');
    db.all(
      `SELECT level,
              COUNT(*) AS total,
              SUM(is_correct) AS correct
         FROM student_assessment_attempts
        WHERE student_id = ?
        GROUP BY level`,
      [req.user.id],
      (e, rows) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json({ summary: rows });
      }
    );
  }
);

// Teacher‐only class summary (stub)
app.get(
  '/api/results/class-summary/:aid',
  authenticate,
  authorize(['teacher']),
  (req, res) => {
    const db = require('./config/db');
    db.all(
      `SELECT student_id,
              level,
              COUNT(*) AS total,
              SUM(is_correct) AS correct
         FROM student_assessment_attempts
        WHERE assessment_id = ?
        GROUP BY student_id, level`,
      [req.params.aid],
      (e, rows) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json({ classSummary: rows });
      }
    );
  }
);

// All other routes → React
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'))
);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
