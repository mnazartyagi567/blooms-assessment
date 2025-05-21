// src/components/CourseList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    program: '',
    semester: '',
    academic_year: ''
  });
  const [editingId, setEditingId] = useState(null)

  const fetchCourses = async () => {
    const res = await axios.get('/api/courses');
    setCourses(res.data.courses);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`/api/courses/${editingId}`, formData)
      setEditingId(null)
    } else {
      await axios.post('/api/courses', formData)
    }
    setFormData({
      name: '',
      code: '',
      program: '',
      semester: '',
      academic_year: ''
    });
    fetchCourses();
  };

   const handleEdit = c => {
       setEditingId(c.id)
       setFormData({
         name: c.name,
       code: c.code,
         program: c.program,
         semester: c.semester,
         academic_year: c.academic_year
       })
     }
    
     const handleDelete = async id => {
       if (!window.confirm('Delete this course and all its assessments?')) return
       await axios.delete(`/api/courses/${id}`)
       fetchCourses()
     }

  return (
    <div>
      <h3>Courses</h3>
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
          <label className="form-label">Code</label>
          <input
            className="form-control"
            name="code"
            value={formData.code}
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
        <button type="submit" className="btn btn-primary">
           {editingId ? 'Save Changes' : 'Add Course'}
         </button>
         {editingId && (
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => {
                setEditingId(null)
                setFormData({ name:'', code:'', program:'', semester:'', academic_year:'' })
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="list-group">
        {courses.map(c => (
          <li key={c.id}
              className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              {c.name} ({c.code}) – {c.program}, Sem: {c.semester}, Year: {c.academic_year}
            </div>
            <div>
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={() => handleEdit(c)}
              >Edit</button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(c.id)}
              >Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseList;
