// backend/routes/grades.js
const express = require('express')
const router  = express.Router()
const Grades  = require('../controllers/gradesController')

// GET existing counts for one question
router.get('/:assessmentId/:questionId', Grades.getGrades)
// POST new counts
router.post('/', Grades.saveGrades)

module.exports = router
