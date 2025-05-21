// backend/routes/courses.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.post('/', courseController.createCourse);
router.get('/', courseController.getAllCourses);

router.put('/:id',    courseController.updateCourse)
router.delete('/:id', courseController.deleteCourse)

module.exports = router;
