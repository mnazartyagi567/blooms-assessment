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
// app.use(express.static(path.join(__dirname, '../frontend/build')));

// Public auth
app.use('/api/auth', authRoutes);
app.use('/api/reports/student', authenticate, authorize(),  studentReportRoutes)

app.use('/api/attempts', authenticate, authorize(), attemptRoutes);
app.use('/api/reports', authenticate, authorize(),  reportRoutes);



// Teacher‐only
app.use('/api/questions', authenticate, authorize(), questionRoutes);
app.use(
  '/api/assessments',
  authenticate,
  authorize(),
  assessmentRoutes
);
app.use('/api/students', authenticate, authorize(), studentRoutes);
app.use('/api/courses', authenticate, authorize(), courseRoutes);

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
  authorize(),
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

const reactBuildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(reactBuildPath));

// Anything that doesn’t start with /api → serve React’s index.html
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(reactBuildPath, 'index.html'));
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
