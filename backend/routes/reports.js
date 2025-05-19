// backend/routes/reports.js
const express = require('express')
const router = express.Router()
const R = require('../controllers/reportsController')
const Fdbk     = require('../controllers/feedbacksController');

// New endpoint for attainment map
router.get('/attainment/:assessmentId', R.getAttainmentReport)

router.get('/attainment/:assessmentId/results', R.getAssessmentResults);

router.get('/feedback/assessment/:assessmentId',
    Fdbk.getAssessmentFeedback);

router.post('/feedback/assessment/:assessmentId',
    Fdbk.saveAssessmentFeedback);

router.delete('/feedback/assessment/:assessmentId',
    Fdbk.deleteAssessmentFeedback);

module.exports = router
