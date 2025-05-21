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

exports.updateStudent = (req, res) => {
  const id = Number(req.params.id)
  studentModel.update(id, req.body, err => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
}

exports.deleteStudent = (req, res) => {
  const id = Number(req.params.id)
  studentModel.delete(id, err => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
}

