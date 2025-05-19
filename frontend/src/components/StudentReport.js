// src/components/assessments/StudentReport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'chart.js/auto';

export default function StudentReport() {
  const initialStudentId = ''
  const [students,    setStudents]    = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [studentId,   setStudentId]   = useState(initialStudentId);
  const [asmtId,      setAsmtId]      = useState('');
  const [report,      setReport]      = useState(null);

  // NEW: feedback state
  const [feedback,    setFeedback]    = useState(null);
  const [isEditing,   setIsEditing]   = useState(false);
  const [fbDraft,     setFbDraft]     = useState('');

  // load dropdowns
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const sid = q.get('studentId');
    if (sid) setStudentId(sid);
    axios.get('/api/students').then(r => setStudents(r.data.students));
    axios.get('/api/assessments').then(r => setAssessments(r.data.assessments));
  }, []);

  // generate report + load feedback
  const generate = () => {
    if (!studentId || !asmtId) return;

    // 1) fetch main report
    axios
      .get(`/api/reports/student/${studentId}/${asmtId}`)
      .then(r => {
        setReport(r.data);

        // 2) fetch feedback for this student+assessment
        return axios.get(`/api/reports/student/feedback/${studentId}/${asmtId}`);
      })
      .then(r => {
        const fb = r.data.feedback;
        setFeedback(fb);
        setIsEditing(fb === null);
        setFbDraft(fb || '');
      })
      .catch(console.error);
  };

  // save feedback
  const saveFeedback = () => {
    if (!fbDraft.trim()) {
      alert('Feedback cannot be empty');
      return;
    }
    axios
      .post(`/api/reports/student/feedback/${studentId}/${asmtId}`, { feedback: fbDraft })
      .then(() => {
        setFeedback(fbDraft);
        setIsEditing(false);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to save feedback');
      });
  };

  // delete feedback
  const deleteFeedback = () => {
    if (!window.confirm('Delete feedback?')) return;
    axios
      .delete(`/api/reports/student/feedback/${studentId}/${asmtId}`)
      .then(() => {
        setFeedback(null);
        setIsEditing(true);
        setFbDraft('');
      })
      .catch(err => {
        console.error(err);
        alert('Failed to delete feedback');
      });
  };

  // PDF exporter (augmented to include feedback on final page)
  const downloadPDF = () => {
    if (!report) return;
    const doc    = new jsPDF('p','pt','a4');
    const margin = 40;

    // --- Page 1: Title + summary table ---
    doc.setFontSize(18);
    doc.text("STUDENTS' OUTCOME ATTAINMENT CARD",
             doc.internal.pageSize.getWidth() / 2,
             50,
             { align: 'center' });
    doc.setFontSize(12);

    // student info
    const info = report.student || {};
    let y = 80;
    doc.text("Name of the Candidate :", margin, y);
    doc.text(info.name || '–', margin + 150, y);
    y += 20;
    doc.text("Programme               :", margin, y);
    doc.text(info.programme || '–', margin + 150, y);
    y += 20;
    doc.text("Semester                :", margin, y);
    doc.text((info.semester != null ? String(info.semester) : '–'),
             margin + 150, y);
    y += 30;

    // level summary
    const lvlHead = [['Domain','% Attainment']];
    const lvlBody = Object.entries(report.levelSummary || {})
      .map(([domain, stats]) => {
        const pct = stats?.avg != null ? `${stats.avg}%` : 'Nil';
        return [domain, pct];
      });

    autoTable(doc, {
      head: lvlHead,
      body: lvlBody,
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33,150,243] },
      columnStyles: { 1: { halign: 'center' } }
    });

    // --- Page 2: question-wise grid ---
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Question-wise Percentage by Level', margin, 50);

    const levelsArr = [
      'Remembering','Understanding',
      'Applying','Analyzing',
      'Evaluating','Creating'
    ];
    const detHead = [['Q No.', ...levelsArr]];

    const details = Array.isArray(report.details) ? report.details : [];
    const detBody = details.map(d => {
      const qNo = d.question_no ?? d.questionNo ?? '–';
      const row = [qNo];
      levelsArr.forEach(lv => {
        row.push(d.level === lv && d.pct != null ? `${d.pct}%` : '-');
      });
      return row;
    });

    autoTable(doc, {
      head: detHead,
      body: detBody,
      startY: 80,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [33,150,243] },
      theme: 'grid'
    });

    // --- Page 3: bar chart ---
    doc.addPage();
    const chartEl = document.getElementById('student-chart');
    if (chartEl) {
      const imgData = chartEl.toDataURL('image/png',1.0);
      const cw = doc.internal.pageSize.getWidth() - margin*2;
      const ch = (cw * chartEl.height) / chartEl.width;
      doc.addImage(imgData,'PNG', margin, 60, cw, ch);
    }

    // --- Page 4: Feedback ---
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Instructor Feedback', margin, 50);
    doc.setFontSize(12);
    const fbText = feedback ?? 'No feedback';
    const lines  = doc.splitTextToSize(fbText, doc.internal.pageSize.getWidth() - margin*2);
    doc.text(lines, margin, 80);

    // Save
    const safeName = (info.name || 'student').replace(/\W+/g,'_');
    const asmtName = report.assessment?.name || `asmt_${asmtId}`;
    doc.save(`Student_Report_${safeName}_${asmtName}.pdf`);
  };

  // chart data
  const lvlEntries = report
    ? Object.entries(report.levelSummary || {})
    : [];
  const labels  = lvlEntries.map(([lvl]) => lvl);
  const dataPct = lvlEntries.map(([,stats]) => stats?.avg ?? 0);

  return (
    <div className="container py-4 text-center">
      <h2>STUDENTS' OUTCOME ATTAINMENT CARD</h2>

      {/* selectors */}
      <div className="row justify-content-center my-4 gx-2">
        <div className="col-auto">
          <select
            className="form-select"
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
          >
            <option value="">-- Choose Student --</option>
            {students.map(s =>
              <option key={s.id} value={s.id}>{s.name}</option>
            )}
          </select>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            value={asmtId}
            onChange={e => setAsmtId(e.target.value)}
          >
            <option value="">-- Choose Assessment --</option>
            {assessments.map(a =>
              <option key={a.id} value={a.id}>
                {a.name} ({a.date})
              </option>
            )}
          </select>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={generate}
            disabled={!studentId || !asmtId}
          >
            Generate Report
          </button>
        </div>
      </div>

      {report && (
        <>
          {/* domain summary */}
          <h3>Domain level summary</h3>
          <table className="table table-bordered w-auto mx-auto">
            <thead className="table-light">
              <tr>
                <th>Domain</th>
                <th>% Attainment</th>
              </tr>
            </thead>
            <tbody>
              {lvlEntries.map(([lv,stats]) => (
                <tr key={lv}>
                  <td>{lv}</td>
                  <td>{stats?.avg != null ? `${stats.avg}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* question table */}
          <h3>Question level report</h3>
          <table className="table table-bordered table-sm w-100 text-center">
            <thead>
              <tr>
                <th>Q No.</th>
                {labels.map(l => <th key={l}>{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {report.details.map((d,i) => (
                <tr key={i}>
                  <td>{d.question_no}</td>
                  {labels.map(l => (
                    <td key={l}>
                      {d.level === l ? `${d.pct}%` : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* bar chart */}
          <div style={{ maxWidth:600, margin:'auto', paddingTop:20 }}>
            <Bar
              id="student-chart"
              data={{
                labels,
                datasets: [{
                  label: '% Attainment',
                  data: dataPct,
                  backgroundColor: 'rgba(33,150,243,0.7)'
                }]
              }}
              options={{
                scales: { y: { beginAtZero:true, max:100 } },
                plugins: {
                  legend: { display:false },
                  tooltip:{ callbacks:{ label: ctx => `${ctx.parsed.y}%` } }
                },
                maintainAspectRatio: false
              }}
            />
          </div>

          {/* ——— Feedback area ——— */}
          <div className="my-4 w-75 mx-auto text-start">
            <h4>Instructor Feedback</h4>

            {isEditing ? (
          <>
            <textarea
              className="form-control mb-2"
              rows={4}
              value={fbDraft}
              onChange={e => setFbDraft(e.target.value)}
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

        {feedback && !isEditing && (
          <button
            className="btn btn-sm btn-outline-secondary ms-2"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}

        {feedback && !isEditing && (
          <button
            className="btn btn-sm btn-outline-danger ms-1"
            onClick={deleteFeedback}
          >
            Delete
          </button>
        )}
          </div>

          {/* download button */}
          <button
            className="btn btn-secondary mb-5"
            onClick={downloadPDF}
          >
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}
