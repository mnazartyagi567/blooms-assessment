// backend/controllers/courseController.js
const courseModel = require('../models/course');

exports.createCourse = (req, res) => {
  courseModel.create(req.body, (err, id) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Course created', id });
  });
};

exports.getAllCourses = (req, res) => {
  courseModel.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ courses: rows });
  });
};
