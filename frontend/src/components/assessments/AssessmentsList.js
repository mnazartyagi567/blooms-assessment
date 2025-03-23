// src/components/assessments/AssessmentsList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AssessmentsList({ onSelectAssessment, onViewReport }) {
  const [assessments, setAssessments] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  const fetchAssessments = async () => {
    const res = await axios.get('http://localhost:5000/api/assessments');
    setAssessments(res.data.assessments);
  };

  const fetchCourses = async () => {
    const res = await axios.get('http://localhost:5000/api/courses');
    setCourses(res.data.courses);
  };

  useEffect(() => {
    fetchAssessments();
    fetchCourses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/assessments', {
      name,
      date,
      course_id: selectedCourse
    });
    setName('');
    setDate('');
    setSelectedCourse('');
    fetchAssessments();
  };

  return (
    <div>
      <h3>Assessments</h3>
      <form onSubmit={handleCreate} className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Name</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Midterm Exam"
            required
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Date</label>
          <input
            className="form-control"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Course</label>
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- No Course --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <button type="submit" className="btn btn-primary w-100">
            Create Assessment
          </button>
        </div>
      </form>

      <ul className="list-group">
        {assessments.map((a) => (
          <li
            key={a.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{a.name}</strong> {a.date ? `(${a.date})` : ''}
              {a.course_name && (
                <span className="text-muted ms-2">[{a.course_name}]</span>
              )}
            </div>
            <div>
              <button
                className="btn btn-sm btn-secondary me-2"
                onClick={() => onSelectAssessment(a.id)}
              >
                Details
              </button>
              <button
                className="btn btn-sm btn-info"
                onClick={() => onViewReport(a.id)}
              >
                View Report
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AssessmentsList;
