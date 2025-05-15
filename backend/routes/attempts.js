// backend/routes/attempts.js
const express  = require('express');
const router   = express.Router();
const Attempts = require('../controllers/attemptsController');

// 1) Record a student's score on one question
//    POST /api/attempts/record
router.post('/record', Attempts.recordAttempt);

// 2) Fetch per‐level summary for one student & assessment
//    GET /api/attempts/report/:studentId/:assessmentId
router.get('/report/:studentId/:assessmentId', Attempts.getStudentReport);

module.exports = router;
