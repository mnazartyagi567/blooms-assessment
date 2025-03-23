// src/components/assessments/AssessmentDetail.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AssessmentDetail({ assessmentId }) {
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');

  // Aggregated
  const [gradeData, setGradeData] = useState({
    grade_a_count: '',
    grade_b_count: '',
    grade_c_count: '',
    grade_d_count: '',
    total_appeared: ''
  });

  // Individual Attempt
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isCorrect, setIsCorrect] = useState('0'); // '1' for correct, '0' for incorrect

  useEffect(() => {
    fetchAssessmentQuestions();
    fetchAllQuestions();
    fetchStudents();
  }, []);

  const fetchAssessmentQuestions = async () => {
    const res = await axios.get(`http://localhost:5000/api/assessments/${assessmentId}/questions`);
    setQuestions(res.data.questions);
  };

  const fetchAllQuestions = async () => {
    const res = await axios.get('http://localhost:5000/api/questions');
    setAllQuestions(res.data.questions);
  };

  const fetchStudents = async () => {
    const res = await axios.get('http://localhost:5000/api/students');
    setStudents(res.data.students);
  };

  const handleAddQuestion = async () => {
    if (!selectedQuestionId) return;
    await axios.post('http://localhost:5000/api/assessments/add-question', {
      assessment_id: assessmentId,
      question_id: selectedQuestionId
    });
    setSelectedQuestionId('');
    fetchAssessmentQuestions();
  };

  const handleSaveGrades = async (question_id) => {
    await axios.post('http://localhost:5000/api/grades', {
      assessment_id: assessmentId,
      question_id,
      grade_a_count: gradeData.grade_a_count,
      grade_b_count: gradeData.grade_b_count,
      grade_c_count: gradeData.grade_c_count,
      grade_d_count: gradeData.grade_d_count,
      total_appeared: gradeData.total_appeared
    });
    alert('Grades saved!');
    setGradeData({
      grade_a_count: '',
      grade_b_count: '',
      grade_c_count: '',
      grade_d_count: '',
      total_appeared: ''
    });
  };

  const handleRecordAttempt = async (question_id) => {
    if (!selectedStudentId) {
      alert('Select a student first.');
      return;
    }
    await axios.post('http://localhost:5000/api/attempts', {
      student_id: selectedStudentId,
      assessment_id: assessmentId,
      question_id,
      is_correct: isCorrect === '1' ? 1 : 0
    });
    alert('Attempt recorded!');
    setSelectedStudentId('');
    setIsCorrect('0');
  };

  return (
    <div>
      <h4>Assessment Detail (ID: {assessmentId})</h4>

      {/* Add question to this assessment */}
      <div className="my-3">
        <label className="form-label">Select Question to Add:</label>
        <div className="d-flex">
          <select
            className="form-select me-2"
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
          >
            <option value="">-- Choose --</option>
            {allQuestions.map((q) => (
              <option key={q.id} value={q.id}>
                Q{q.question_no} ({q.level})
              </option>
            ))}
          </select>
          <button className="btn btn-success" onClick={handleAddQuestion}>
            Add to Assessment
          </button>
        </div>
      </div>

      <hr />

      {/* List of questions in this assessment */}
      <h5>Questions in this Assessment</h5>
      {questions.length === 0 && <p>No questions added yet.</p>}
      {questions.map((q) => (
        <div key={q.id} className="border rounded p-2 mb-3">
          <strong>
            Q{q.question_no} - {q.level}
          </strong>
          <p className="mb-1">
            Keywords: {q.keywords} | Spec: {q.specification}
          </p>

          {/* Aggregated approach */}
          <div className="row g-2 align-items-end mb-2">
            <div className="col-md-2">
              <label className="form-label">A Count</label>
              <input
                className="form-control"
                type="number"
                value={gradeData.grade_a_count}
                onChange={(e) => setGradeData((prev) => ({ ...prev, grade_a_count: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">B Count</label>
              <input
                className="form-control"
                type="number"
                value={gradeData.grade_b_count}
                onChange={(e) => setGradeData((prev) => ({ ...prev, grade_b_count: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">C Count</label>
              <input
                className="form-control"
                type="number"
                value={gradeData.grade_c_count}
                onChange={(e) => setGradeData((prev) => ({ ...prev, grade_c_count: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">D Count</label>
              <input
                className="form-control"
                type="number"
                value={gradeData.grade_d_count}
                onChange={(e) => setGradeData((prev) => ({ ...prev, grade_d_count: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Total Appeared</label>
              <input
                className="form-control"
                type="number"
                value={gradeData.total_appeared}
                onChange={(e) => setGradeData((prev) => ({ ...prev, total_appeared: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={() => handleSaveGrades(q.id)}
              >
                Save Grades
              </button>
            </div>
          </div>

          {/* Individual attempts approach */}
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Select Student</label>
              <select
                className="form-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">-- Choose Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Roll: {s.roll_no})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Is Correct?</label>
              <select
                className="form-select"
                value={isCorrect}
                onChange={(e) => setIsCorrect(e.target.value)}
              >
                <option value="0">Incorrect</option>
                <option value="1">Correct</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-success w-100"
                onClick={() => handleRecordAttempt(q.id)}
              >
                Record Attempt
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AssessmentDetail;
