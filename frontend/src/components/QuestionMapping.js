// src/components/QuestionMapping.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function QuestionMapping() {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    question_no: '',
    level: '',
    keywords: '',
    specification: '',
    co: '', // optional
    po: '' // optional
  });

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('/api/questions');
      setQuestions(res.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/questions', formData);
      setFormData({
        question_no: '',
        level: '',
        keywords: '',
        specification: '',
        co: '',
        po: ''
      });
      fetchQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  return (
    <div>
      <h3>Question Mapping</h3>
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-2">
          <label className="form-label">Question No</label>
          <input
            className="form-control"
            name="question_no"
            value={formData.question_no}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Level</label>
          <input
            className="form-control"
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Keywords</label>
          <input
            className="form-control"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Specification</label>
          <input
            className="form-control"
            name="specification"
            value={formData.specification}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">CO (optional)</label>
          <input
            className="form-control"
            name="co"
            value={formData.co}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">PO (optional)</label>
          <input
            className="form-control"
            name="po"
            value={formData.po}
            onChange={handleChange}
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-success">Add Question</button>
        </div>
      </form>

      <h5>Existing Questions</h5>
      <ul className="list-group">
        {questions.map((q) => (
          <li key={q.id} className="list-group-item">
            <strong>Q{q.question_no}</strong> - {q.level} | {q.keywords} | {q.specification}
            {q.co && ` | CO: ${q.co}`}
            {q.po && ` | PO: ${q.po}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuestionMapping;
