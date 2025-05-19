// backend/routes/questions.js
const express = require('express');
const router = express.Router();
const Q = require('../models/questions');
const C = require('../controllers/questionController');

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

// after your POST and GET…
router.put('/:id', (req, res) => {
  C.updateQuestion(req, res);
});

router.delete('/:id', (req, res) => {
  C.deleteQuestion(req, res);
});

module.exports = router;
