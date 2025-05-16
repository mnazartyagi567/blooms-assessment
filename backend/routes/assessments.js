// backend/routes/assessments.js
const express = require('express');
const R       = require('../controllers/assessmentController');
const router  = express.Router();

// create a new assessment
router.post('/',            R.createAssessment);

// list all assessments
router.get('/',             R.getAllAssessments);

// add a question *to a particular assessment*, now under `/:id/questions`
router.post('/:id/questions', R.addQuestion);

// fetch all questions for one assessment
router.get('/:id/questions', R.getAssessmentQuestions);

module.exports = router;
