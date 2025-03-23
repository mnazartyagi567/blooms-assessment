// backend/routes/attempts.js
const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const reportController = require('../controllers/reportController');

// Record an individual attempt
router.post('/', attemptController.saveAttempt);

// Get attempts for a student & assessment
router.get('/:studentId/:assessmentId', attemptController.getStudentAssessmentAttempts);

// Individual student bloom report
router.get('/report/:studentId/:assessmentId', reportController.getStudentBloomReport);

module.exports = router;
