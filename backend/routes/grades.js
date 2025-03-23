// backend/routes/grades.js
const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const reportController = require('../controllers/reportController');

router.post('/', gradeController.saveGradeDistribution);

// Aggregated Bloom's-based report
router.get('/report/:assessmentId', reportController.getAssessmentReport);

module.exports = router;
