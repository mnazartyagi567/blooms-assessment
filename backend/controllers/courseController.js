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


exports.updateCourse = (req, res) => {
  const id = Number(req.params.id)
  courseModel.update(id, req.body, err => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
}

exports.deleteCourse = (req, res) => {
  const id = Number(req.params.id)
  courseModel.delete(id, err => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
}
