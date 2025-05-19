
const questionModel = require('../models/questions');

exports.getAllQuestions = (req, res) => {
  questionModel.getAll((err, questions) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ questions });
  });
};

exports.createQuestion = (req, res) => {
  const { question_no, level, keywords, specification } = req.body;
  if (!question_no || !level) {
    return res.status(400).json({ error: 'Question number and level are required.' });
  }
  questionModel.create({ question_no, level, keywords, specification }, (err, lastID) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Question added successfully', id: lastID });
  });
};


// Update
exports.updateQuestion = (req, res) => {
  const id = Number(req.params.id);
  questionModel.update(id, req.body, err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Question updated' });
  });
};

// Delete
exports.deleteQuestion = (req, res) => {
  const id = Number(req.params.id);
  questionModel.delete(id, err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Question deleted' });
  });
};