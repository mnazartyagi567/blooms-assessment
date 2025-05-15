// backend/routes/assessments.js
const express              = require('express');
const router               = express.Router();
const AssessmentController = require('../controllers/assessmentController');

// Create a new assessment
router.post('/', AssessmentController.createAssessment);

// List all assessments
router.get('/', AssessmentController.getAllAssessments);

// Attach a question to an assessment
// POST { assessment_id, question_id }
router.post('/questions', AssessmentController.addQuestion);

// Get all questions attached to one assessment
router.get('/:id/questions', AssessmentController.getAssessmentQuestions);

module.exports = router;
