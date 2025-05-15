// src/components/assessments/AssessmentDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AssessmentDetail({ assessmentId }) {
  const [questions, setQuestions] = useState([]);
  const [students,  setStudents]  = useState([]);
  const [selected, setSelected]   = useState({
    studentId: '',
    score:     ''
  });

  // fetch questions + student list
  useEffect(() => {
    axios.get(`/api/assessments/${assessmentId}/questions`)
      .then(r => setQuestions(r.data.questions))
      .catch(console.error);
    axios.get('/api/students')
      .then(r => setStudents(r.data.students))
      .catch(console.error);
  }, [assessmentId]);

  // record or update a score
  const handleRecord = (questionId) => {
    if (!selected.studentId || selected.score === '') {
      alert('Please choose a student and enter a score.');
      return;
    }
    axios.post('/api/attempts/record', {
      student_id:    selected.studentId,
      assessment_id: assessmentId,
      question_id:   questionId,
      score:         Number(selected.score)
    })
    .then(() => {
      // optionally reload report or give feedback...
      alert('Score saved.');
    })
    .catch(err => {
      console.error(err);
      alert('Failed to save score.');
    });
  };

  return (
    <div>
      <h3>Questions in this Assessment</h3>
      {questions.map((q) => (
        <div key={q.id} className="card mb-4 p-3">
          <h5>Q{q.question_no} – {q.question_text}</h5>
          <p>
            <strong>Level:</strong> {q.level || '–'}<br/>
            <strong>Keywords:</strong> {q.keywords || '–'}<br/>
            <strong>Spec:</strong> {q.specification || '–'}
          </p>

          {/* Record Score */}
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select w-auto"
              value={selected.studentId}
              onChange={e => setSelected(s => ({
                ...s,
                studentId: e.target.value
              }))}
            >
              <option value="">-- Choose Student --</option>
              {students.map(s =>
                <option key={s.id} value={s.id}>{s.name}</option>
              )}
            </select>

            <input
              type="number"
              className="form-control w-auto"
              placeholder="Score"
              min="0"
              value={selected.score}
              onChange={e => setSelected(s => ({
                ...s,
                score: e.target.value
              }))}
            />

            <button
              className="btn btn-success"
              onClick={() => handleRecord(q.id)}
            >
              Record Score
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
