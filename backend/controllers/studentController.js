// backend/controllers/studentController.js
const studentModel = require('../models/student');

exports.createStudent = (req, res) => {
  studentModel.create(req.body, (err, id) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Student created', id });
  });
};

exports.getAllStudents = (req, res) => {
  studentModel.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ students: rows });
  });
};
