const express = require('express')
const router = express.Router()
const StudentReports = require('../controllers/studentReportsController')
const Fdbk = require('../controllers/feedbacksController');

// GET /api/reports/student/:studentId/:assessmentId
router.get('/:studentId/:assessmentId', StudentReports.getStudentAssessmentReport)

router.get('/feedback/:studentId/:assessmentId',
    Fdbk.getStudentFeedback);

router.post('/feedback/:studentId/:assessmentId',
    Fdbk.saveStudentFeedback);

router.delete('/feedback/:studentId/:assessmentId',
    Fdbk.deleteStudentFeedback);

module.exports = router
