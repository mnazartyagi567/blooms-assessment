// backend/routes/reports.js
const express = require('express');
const router  = express.Router();
const R       = require('../controllers/attemptsController');

// Instructor: class-level report for one assessment
router.get('/class/:assessmentId', R.getClassReport);

// (You can also expose the student-level report here if you want students to fetch their own)
router.get('/student/:studentId/:assessmentId', R.getStudentReport);

module.exports = router;
