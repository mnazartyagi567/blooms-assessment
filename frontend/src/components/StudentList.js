// src/components/StudentList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    roll_no: '',
    program: '',
    semester: '',
    academic_year: ''
  });

  const fetchStudents = async () => {
    const res = await axios.get('http://localhost:5000/api/students');
    setStudents(res.data.students);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/students', formData);
    setFormData({
      name: '',
      roll_no: '',
      program: '',
      semester: '',
      academic_year: ''
    });
    fetchStudents();
  };

  return (
    <div>
      <h3>Students</h3>
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Name</label>
          <input
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Roll No</label>
          <input
            className="form-control"
            name="roll_no"
            value={formData.roll_no}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Program</label>
          <input
            className="form-control"
            name="program"
            value={formData.program}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Semester</label>
          <input
            className="form-control"
            type="number"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Academic Year</label>
          <input
            className="form-control"
            name="academic_year"
            value={formData.academic_year}
            onChange={handleChange}
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Add Student</button>
        </div>
      </form>

      <ul className="list-group">
        {students.map((s) => (
          <li key={s.id} className="list-group-item">
            {s.name} (Roll No: {s.roll_no}) - Program: {s.program}, Sem: {s.semester}, Year: {s.academic_year}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentList;
