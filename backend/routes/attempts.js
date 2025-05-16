// backend/routes/attempts.js
const express  = require('express');
const A        = require('../controllers/attemptsController');
const router   = express.Router();

// record one student-question score
// POST /api/attempts/record
router.post('/record', A.recordAttempt);

// fetch one student’s per-level summary
// GET  /api/attempts/report/:studentId/:assessmentId
router.get('/report/:studentId/:assessmentId', A.getStudentReport);

module.exports = router;
