// src/components/assessments/AssessmentReport.jsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Bar } from 'react-chartjs-2'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// register Chart.js scales & elements
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function AssessmentReport({ assessmentId }) {
  const [rows, setRows] = useState([])         // aggregated attainment
  const [details, setDetails] = useState([])   // question‐wise student scores
  const [feedback, setFeedback] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draftFeedback, setDraft] = useState('');

  useEffect(() => {
    // 1) get the level‐by‐level attainment
    axios
      .get(`/api/reports/attainment/${assessmentId}`)
      .then(r => setRows(r.data.attainment))
      .catch(console.error)

    // 2) get the per-student, per-question raw scores
    axios
      .get(`/api/reports/attainment/${assessmentId}/results`)
      .then(r => setDetails(r.data.details))
      .catch(console.error)

    axios
      .get(`/api/reports/feedback/assessment/${assessmentId}`)
      .then(r => {
        setFeedback(r.data.feedback);        // null or string
        setDraft(r.data.feedback || '');
        setEditing(!r.data.feedback);        // if no fb => editing=true
      })
      .catch(console.error)
  }, [assessmentId])

  if (!rows.length) return <p>Loading report…</p>

  //
  // Build the chart data from the “rows” (level aggregates)
  //
  const levels = {}
  rows.forEach(r => {
    if (!levels[r.level]) levels[r.level] = { pass: 0, tot: 0 }
    // pass = excellent + very_good + good
    levels[r.level].pass += (r.excellent + r.very_good + r.good)
    levels[r.level].tot += r.total
  })

  const chartLabels = Object.keys(levels)
  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Total Attainments',
      data: chartLabels.map(l => levels[l].tot || 0),
      backgroundColor: 'rgba(33,150,243,0.7)'
    }]
  }
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: v => Number(v).toFixed(0) }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.parsed.y}`
        }
      }
    },
    maintainAspectRatio: false
  }

  const saveFeedback = () => {
    if (!draftFeedback.trim()) {
      return alert('Feedback is required');
    }
    axios
      .post(
        `/api/reports/feedback/assessment/${assessmentId}`,
        { feedback: draftFeedback }
      )
      .then(() => {
        setFeedback(draftFeedback);
        setEditing(false);
      })
      .catch(console.error);
  };

  const deleteFeedback = () => {
    if (!window.confirm('Delete feedback forever?')) return;
    axios
      .delete(`/api/reports/feedback/assessment/${assessmentId}`)
      .then(() => {
        setFeedback(null);
        setDraft('');
        setEditing(true);
      })
      .catch(console.error);
  };

  //
  // PDF download: same as before (you can extend to include the details table as a second page)
  //
  const downloadPDF = () => {
    const doc    = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    let   y      = 40;  // ← start y here
  
    // ————————— Page 1: Title + level table —————————
    doc.setFontSize(18);
    doc.text('Assessment Outcome Attainment Map', margin, y);
    y +=  20;
    
    doc.setFontSize(12);
    doc.text(`Assessment #${assessmentId}`, margin, y);
    y +=  20;
  
    // build level table head+body
    const levelHead = [[ 'Level', 'Spec',
      'Excellent', 'Very Good', 'Good',
      'Satisfactory', 'Not Satisfactory', 'Total Students'
    ]];
    const levelBody = rows.map(r => ([
      // r.questionNo ?? r.question_no,
      r.level,
      r.spec ?? r.specification,
      r.excellent,
      r.very_good,
      r.good,
      r.satisfactory,
      r.not_satisfactory,
      r.total
    ]));
  
    autoTable(doc, {
      head:       levelHead,
      body:       levelBody,
      startY:     y,
      margin:     { left:margin, right:margin },
      styles:     { fontSize: 10 },
      headStyles: { fillColor: [33,150,243] },
      theme:      'grid'
    });
  
    // advance y past table
    y = doc.lastAutoTable.finalY +  30;
  
    // ————————— Page 2: Student-question detail table —————————
    doc.addPage();
    y = 40;
    doc.setFontSize(16);
    doc.text('Student Question-wise Scores', margin, y);
    y +=  20;
  
    const detailHead = [[
      'Student', 'Q No.', 'Level',
      'Marks Obtained', 'Total Marks'
    ]];
    const detailBody = details.map(d => ([
      d.student,
      d.question_no,
      d.level,
      d.obtained,
      d.max_score
    ]));
  
    autoTable(doc, {
      head:       detailHead,
      body:       detailBody,
      startY:     y,
      margin:     { left:margin, right:margin },
      styles:     { fontSize: 10 },
      headStyles: { fillColor: [33,150,243] },
      theme:      'grid'
    });
  
    // advance y again
    y = doc.lastAutoTable.finalY +  30;
  
    // ————————— Page 3: Chart —————————
    doc.addPage();
    // we’ll reuse y if you want to draw text above the chart, otherwise chart starts at fixed y
    const chartCanvas = document.getElementById('attainment-chart');
    const imgData     = chartCanvas.toDataURL('image/png',1.0);
    const chartW      = doc.internal.pageSize.getWidth() - margin*2;
    const chartH      = chartW * chartCanvas.height / chartCanvas.width;
    doc.addImage(imgData, 'PNG', margin, 60, chartW, chartH);
  
    // ————————— Page 4: Feedback —————————
    doc.addPage();
    y = 40;
    doc.setFontSize(12);
    doc.text('Instructor feedback:', margin, y);
    y +=  20;
  
    const fb = feedback || 'No feedback';
    const wrapped = doc.splitTextToSize(
      fb,
      doc.internal.pageSize.getWidth() - margin*2
    );
    doc.setFontSize(10);
    doc.text(wrapped, margin, y);
  
    // ————————— Finally, save! —————————
    doc.save(`Assessment_${assessmentId}_Report.pdf`);
  };
  

  return (
    <div className="text-center">
      <h3>Assessment Outcome Attainment Map</h3>

      {/* ——— Level table ——— */}
      <table
        className="table table-sm mx-auto"
        style={{ display: 'inline-table' }}
      >
        <thead className="table-primary">
          <tr>
            <th>Level</th>
            <th>Spec</th>
            <th>Excellent</th>
            <th>Very Good</th>
            <th>Good</th>
            <th>Satisfactory</th>
            <th>Not Satisfactory</th>
            <th>Total Students</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.question_no}>
              <td>{r.level}</td>
              <td>{r.spec}</td>
              <td>{r.excellent}</td>
              <td>{r.very_good}</td>
              <td>{r.good}</td>
              <td>{r.satisfactory}</td>
              <td>{r.not_satisfactory}</td>
              <td>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* ——— Student Question-wise Scores ——— */}
      {details.length > 0 && (
        <>
          <h4>Student Question-wise Scores</h4>
          <table
            className="table table-sm mx-auto"
            style={{ display: 'inline-table' }}
          >
            <thead className="table-light">
              <tr>
                <th>Student</th>
                <th>Q No.</th>
                <th>Level</th>
                <th>Marks Obtained</th>
                <th>Total Marks</th>
              </tr>
            </thead>
            <tbody>
              {details.map((r, i) => (
                <tr key={i}>
                  <td>{r.student}</td>
                  <td>{r.question_no}</td>
                  <td>{r.level}</td>
                  <td>{r.obtained}</td>
                  <td>{r.max_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ——— Chart ——— */}
      <div style={{ maxWidth: 600, margin: '1rem auto' }}>
        <Bar
          id="attainment-chart"
          data={chartData}
          options={chartOptions}
        />
      </div>

      {/* ——— Instructor Feedback ——— */}
      <div className="mt-4 text-start w-75 mx-auto">
        <label className="form-label"><strong>Instructor feedback</strong></label>

        {editing ? (
          <>
            <textarea
              className="form-control mb-2"
              rows={4}
              value={draftFeedback}
              onChange={e => setDraft(e.target.value)}
            />
            <button className="btn btn-sm btn-primary" onClick={saveFeedback}>
              Record feedback
            </button>
          </>
        ) : (
          <div className="border rounded p-3 mb-2">
            {feedback || <em>No feedback</em>}
          </div>
        )}

        {feedback && !editing && (
          <button
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}

        {feedback && !editing && (
          <button
            className="btn btn-sm btn-outline-danger ms-1"
            onClick={deleteFeedback}
          >
            Delete
          </button>
        )}
      </div>

      {/* ——— Download PDF ——— */}
      <button
        className="btn btn-secondary mb-4"
        onClick={downloadPDF}
      >
        Download PDF
      </button>
    </div>
  )
}
