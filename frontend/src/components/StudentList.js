// src/components/StudentList.js
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function StudentList() {
  const [students, setStudents]     = useState([])
  const [formData, setFormData]     = useState({
    name: '', roll_no: '', program: '', semester: '', academic_year: ''
  })
  const [editingId, setEditingId]   = useState(null)

  // 1) fetch students
  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/api/students')
      setStudents(data.students)
    } catch (err) {
      console.error('Failed to fetch students', err)
    }
  }
   useEffect(() => {
       fetchStudents()
     }, [])

  // 2) two‐way bind form
  const handleChange = e => {
    setFormData(fd => ({ ...fd, [e.target.name]: e.target.value }))
  }

  // 3) add or save
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (editingId) {
        // UPDATE
        await axios.put(`/api/students/${editingId}`, formData)
      } else {
        // CREATE
        await axios.post('/api/students', formData)
      }
      // reset
      setEditingId(null)
      setFormData({ name:'', roll_no:'', program:'', semester:'', academic_year:'' })
      fetchStudents()
    } catch (err) {
      console.error('Save failed', err)
      alert('Could not save student')
    }
  }

  // 4) start editing
  const handleEdit = s => {
    setEditingId(s.id)
    setFormData({
      name:          s.name,
      roll_no:       s.roll_no,
      program:       s.program,
      semester:      s.semester,
      academic_year: s.academic_year
    })
  }

  // 5) delete (and cascade attempts)
  const handleDelete = async id => {
    if (!window.confirm('Delete this student and all their scores?')) return
    try {
      await axios.delete(`/api/students/${id}`)
      fetchStudents()
    } catch (err) {
      console.error('Delete failed', err)
      alert('Could not delete student')
    }
  }

  return (
    <div>
      <h3>Students</h3>

      {/* ─── add / edit form ─── */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Name</label>
          <input
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Roll No</label>
          <input
            name="roll_no"
            className="form-control"
            value={formData.roll_no}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Program</label>
          <input
            name="program"
            className="form-control"
            value={formData.program}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Semester</label>
          <input
            type="number"
            name="semester"
            className="form-control"
            value={formData.semester}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Academic Year</label>
          <input
            name="academic_year"
            className="form-control"
            value={formData.academic_year}
            onChange={handleChange}
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Save' : 'Add Student'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => {
                setEditingId(null)
                setFormData({ name:'', roll_no:'', program:'', semester:'', academic_year:'' })
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ─── list ─── */}
      <ul className="list-group">
        {students.map(s => (
          <li
            key={s.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              {s.name} (Roll No: {s.roll_no}) – Program: {s.program}, Sem: {s.semester}, Year: {s.academic_year}
            </div>
            <div>
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={() => handleEdit(s)}
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger me-2"
                onClick={() => handleDelete(s.id)}
              >
                Delete
              </button>
              <a
                href={`/student-report?studentId=${s.id}`}
                className="btn btn-sm btn-outline-primary"
              >
                See Report
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
