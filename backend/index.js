// backend/index.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const assessmentRoutes = require('./routes/assessments');
const gradeRoutes = require('./routes/grades');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const attemptRoutes = require('./routes/attempts');

const app = express();
// Use the PORT from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// 1) Serve the React build folder
app.use(express.static(path.join(__dirname, '../frontend/build')));

// 2) Your existing API routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/grades', gradeRoutes); 
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attempts', attemptRoutes);

// 3) If no API route matches, serve the React index.html (the "catch-all" route)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// 4) Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
