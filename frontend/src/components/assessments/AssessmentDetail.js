// src/components/assessments/AssessmentDetail.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function AssessmentDetail({ assessmentId }) {
  // questions _already_ in this assessment
  const [assessmentQuestions, setAssessmentQuestions] = useState([])
  // full bank of all questions, for the dropdown
  const [allQuestions,        setAllQuestions]        = useState([])
  // students list
  const [students,            setStudents]            = useState([])
  // new question ↔ max_score being added
  const [newQ,                setNewQ]                = useState({
    question_id: '',
    max_score:   ''
  })
  // per‐question pick of student+score inputs
  const [pick,                setPick]                = useState({})

  // 1) Load full question‐bank once on mount
  useEffect(() => {
    axios.get('/api/questions')
      .then(r => setAllQuestions(r.data.questions))
      .catch(console.error)
  }, [])

  // 2) Load which questions are already on this assessment
  useEffect(() => {
    axios.get(`/api/assessments/${assessmentId}/questions`)
      .then(r => setAssessmentQuestions(r.data.questions))
      .catch(console.error)
  }, [assessmentId])

  // 3) Load students list
  useEffect(() => {
    axios.get('/api/students')
      .then(r => setStudents(r.data.students))
      .catch(console.error)
  }, [])

  // Add a question → this assessment
  const handleAdd = () => {
    if (!newQ.question_id || !newQ.max_score) return
    axios.post(
      `/api/assessments/${assessmentId}/questions`,
      {
        question_id: Number(newQ.question_id),
        max_score:   Number(newQ.max_score)
      }
    )
    .then(() => axios.get(`/api/assessments/${assessmentId}/questions`))
    .then(r => {
      setAssessmentQuestions(r.data.questions)
      setNewQ({ question_id:'', max_score:'' })
    })
    .catch(console.error)
  }

  // Record or update a student’s score on one question
  const handleRecordScore = (qId) => {
    const entry = pick[qId] || {}
    const sid   = Number(entry.student_id)
    const sc    = Number(entry.score)
    if (!sid || isNaN(sc)) return

    axios.post('/api/attempts/record', {
      student_id:    sid,
      assessment_id: assessmentId,
      question_id:   qId,
      score:         sc
    })
    .then(() => alert('Score saved'))
    .catch(console.error)
  }

  return (
    <div className="container py-3">
      <h3>Questions in this Assessment</h3>

      {/* ——— Add a new question to this assessment ——— */}
      <div className="mb-4 d-flex gap-2">
        <select
          className="form-select w-auto"
          value={newQ.question_id}
          onChange={e =>
            setNewQ(q => ({ ...q, question_id: e.target.value }))
          }
        >
          <option value="">-- Pick a question --</option>
          {allQuestions.map(q => (
            <option key={q.id} value={q.id}>
              Q{q.question_no} - {q.question_text.slice(0,40)}…
            </option>
          ))}
        </select>

        <input
          type="number"
          className="form-control w-auto"
          placeholder="Max Score"
          min="0"
          value={newQ.max_score}
          onChange={e =>
            setNewQ(q => ({ ...q, max_score: e.target.value }))
          }
        />

        <button
          className="btn btn-success"
          onClick={handleAdd}
        >
          Add Question
        </button>
      </div>

      {/* ——— List each question already in this assessment ——— */}
      {assessmentQuestions.length === 0 && (
        <p className="text-muted">No questions in this assessment yet.</p>
      )}

      {assessmentQuestions.map(q => (
        <div key={q.aq_id} className="card mb-3 p-3">
          <h5>
            Q{q.question_no} - {q.question_text}
          </h5>
          <p>
            <strong>Level:</strong> {q.level || '–'} &nbsp;|&nbsp;
            <strong>Keywords:</strong> {q.keywords || '–'} &nbsp;|&nbsp;
            <strong>Spec:</strong> {q.specification || '–'} &nbsp;|&nbsp;
            <strong>Max:</strong> {q.max_score}
          </p>

          {/* ——— Record per‐student score ——— */}
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select w-auto"
              value={pick[q.id]?.student_id || ''}
              onChange={e =>
                setPick(p => ({
                  ...p,
                  [q.id]: { ...p[q.id], student_id: e.target.value }
                }))
              }
            >
              <option value="">-- Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="form-control w-auto"
              placeholder="Score"
              min="0"
              max={q.max_score}
              value={pick[q.id]?.score || ''}
              onChange={e =>
                setPick(p => ({
                  ...p,
                  [q.id]: { ...p[q.id], score: e.target.value }
                }))
              }
            />

            <button
              className="btn btn-primary"
              onClick={() => handleRecordScore(q.id)}
            >
              Record Score
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
