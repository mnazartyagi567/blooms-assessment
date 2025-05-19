// src/components/assessments/AssessmentDetail.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function AssessmentDetail({ assessmentId }) {
  const [assessmentQuestions, setAssessmentQuestions] = useState([])
  const [allQuestions,        setAllQuestions]        = useState([])
  const [students,            setStudents]            = useState([])
  const [newQ,                setNewQ]                = useState({
    question_id: '',
    max_score:   ''
  })
  const [pick,                setPick]                = useState({})
  const [notification,        setNotification]        = useState('')

  // 1) load full bank
  useEffect(() => {
    axios.get('/api/questions')
      .then(r => setAllQuestions(r.data.questions))
      .catch(console.error)
  }, [])

  // 2) load existing assessment→questions
  const refreshAssessmentQuestions = () => {
    axios.get(`/api/assessments/${assessmentId}/questions`)
      .then(r => setAssessmentQuestions(r.data.questions))
      .catch(console.error)
  }
  useEffect(refreshAssessmentQuestions, [assessmentId])

  // 3) load students
  useEffect(() => {
    axios.get('/api/students')
      .then(r => setStudents(r.data.students))
      .catch(console.error)
  }, [])

  // only show questions not yet added
  const availableQuestions = allQuestions.filter(
    q => !assessmentQuestions.some(aq => aq.id === q.id)
  )

  // add new question
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newQ.question_id || !newQ.max_score) return
    axios.post(
      `/api/assessments/${assessmentId}/questions`,
      {
        question_id: Number(newQ.question_id),
        max_score:   Number(newQ.max_score)
      }
    )
    .then(() => {
      setNewQ({ question_id:'', max_score:'' })
      refreshAssessmentQuestions()
    })
    .catch(console.error)
  }

  // remove a question mapping
  const handleRemove = (aq_id) => {
    if (!window.confirm('Remove this question from the assessment?')) return
    axios.delete(
      `/api/assessments/${assessmentId}/questions/${aq_id}`
    )
    .then(refreshAssessmentQuestions)
    .catch(console.error)
  }

  // record or update score
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
    .then(() => {
      // show a transient notification
      setNotification('Score saved')
      setTimeout(() => setNotification(''), 2000)
    })
    .catch(console.error)
  }

  // fetch existing score when you pick a student
  const fetchExistingScore = (qId, sid) => {
    axios.get('/api/attempts/score', {
      params: { student_id: sid, assessment_id: assessmentId, question_id: qId }
    })
    .then(r =>
      setPick(p => ({
        ...p,
        [qId]: { ...p[qId], score: r.data.score }
      }))
    )
    .catch(console.error)
  }

  return (
    <div className="container py-3 position-relative">
      {/* transient toast */}
      {notification && (
        <div
          className="alert alert-success position-fixed top-0 end-0 m-3"
          style={{ zIndex: 1050 }}
        >
          {notification}
        </div>
      )}

      <h3>Add new questions</h3>

      {/* — add new question — */}
      <form className="mb-4 d-flex gap-2" onSubmit={handleAdd}>
   <select
     className="form-select w-auto"
     value={newQ.question_id}
     onChange={e => setNewQ(q => ({ ...q, question_id: e.target.value }))}
     required
   >
     <option value="">-- Pick a question --</option>
     {availableQuestions.map(q => (
       <option key={q.id} value={q.id}>
         Q{q.question_no} – {q.question_text.slice(0,40)}…
       </option>
     ))}
   </select>

   <input
     type="number"
     className="form-control w-auto"
     placeholder="Max Score"
     min="0"
     value={newQ.max_score}
     onChange={e => setNewQ(q => ({ ...q, max_score: e.target.value }))}
     required
   />

   <button type="submit" className="btn btn-success">
     Add Question
   </button>
 </form>

      {/* — if no questions yet — */}
      {assessmentQuestions.length === 0 && (
        <p className="text-muted">No questions in this assessment yet.</p>
      )}

      {/* — list each added question — */}
      <h3>Questions in this Assessment</h3>
      {assessmentQuestions.map(q => (
        <div key={q.aq_id} className="card mb-3 p-3 position-relative">
          <h5>
            Q{q.question_no} – {q.question_text}
          </h5>
          <p>
            <strong>Level:</strong> {q.level || '–'} &nbsp;|&nbsp;
            <strong>Keywords:</strong> {q.keywords || '–'} &nbsp;|&nbsp;
            <strong>Spec:</strong> {q.specification || '–'} &nbsp;|&nbsp;
            <strong>Max Score:</strong> {q.max_score}
          </p>

          {/* remove button */}
          <button
            className="btn btn-sm btn-outline-danger position-absolute"
            style={{ bottom: '10px', right: '10px' }}
            onClick={() => handleRemove(q.aq_id)}
          >
            Remove
          </button>

          {/* record per-student score */}
          <div className="d-flex gap-2 align-items-center mt-3">
            <select
              className="form-select w-auto"
              value={pick[q.id]?.student_id || ''}
              onChange={e => {
                const sid = e.target.value
                setPick(p => ({
                  ...p,
                  [q.id]: { ...p[q.id], student_id: sid }
                }))
                if (sid) fetchExistingScore(q.id, sid)
              }}
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

            {/* show existing score */}
            {pick[q.id]?.score != null && (
              <small className="ms-3 text-muted">
                <span className="fw-bold">Current Score:</span> {pick[q.id].score}
              </small>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
