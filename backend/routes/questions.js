// backend/routes/questions.js
const express = require('express');
const router = express.Router();
const Q = require('../models/questions');

// Create a question
router.post('/', (req, res) => {
  Q.create(req.body, (err, id) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id });
  });
});

// List all questions
router.get('/', (req, res) => {
  Q.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ questions: rows });
  });
});

module.exports = router;
