// backend/routes/assessments.js
const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

router.post('/', assessmentController.createAssessment);
router.get('/', assessmentController.getAllAssessments);
router.post('/add-question', assessmentController.addQuestion);
router.get('/:id/questions', assessmentController.getAssessmentQuestions);

module.exports = router;
