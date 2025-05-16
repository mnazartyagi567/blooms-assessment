const express = require('express')
const router  = express.Router()
const StudentReports = require('../controllers/studentReportsController')

// GET /api/reports/student/:studentId/:assessmentId
router.get('/:studentId/:assessmentId', StudentReports.getStudentAssessmentReport)

module.exports = router
