// src/components/assessments/StudentReport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import 'chart.js/auto';

export default function StudentReport() {
  const [students, setStudents]       = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [studentId, setStudentId]     = useState('');
  const [asmtId, setAsmtId]           = useState('');
  const [report, setReport]           = useState(null);
  const selectedStudent = students.find(s => s.id === +studentId)

  // Fetch dropdown data
  useEffect(() => {
    axios.get('/api/students').then(r => setStudents(r.data.students));
    axios.get('/api/assessments').then(r => setAssessments(r.data.assessments));
  }, []);

  // Generate report
  const generate = () => {
    if (!studentId || !asmtId) return;
    axios
      .get(`/api/reports/student/${studentId}/${asmtId}`)
      .then(r => {
                // normalize: replace any null entries with default {avg: null, count: 0}
                const raw = r.data.levelSummary
                const norm = {}
                Object.entries(raw).forEach(([lvl, d]) => {
                  norm[lvl] = d || { avg: null, num_questions: 0 }
                })
                setReport({ student: r.data.student, levelSummary: norm })
              })
  };

  // PDF download
  const downloadPDF = () => {
    if (!report) return;
  
    // 1) set up
    const doc    = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let   y      = 50;
  
    // 2) title, centered
    doc.setFontSize(18);
    doc.text("STUDENTS' OUTCOME ATTAINMENT CARD", 
             doc.internal.pageSize.getWidth() / 2, 
             y, 
             { align: 'center' });
    y += 30;
  
    // 3) student + assessment info
    doc.setFontSize(12);
    const info = report.student || {};
    const asmt = report.assessment || {};
    const leftX  = margin;
    const labelX = margin + 140;
  
    doc.text("Name of the Candidate", leftX, y);
    doc.text(": " + (info.name || ''), labelX, y);
    y += 20;
  
    doc.text("Programme", leftX, y);
    doc.text(": " + (info.programme || ''), labelX, y);
    y += 20;
  
    doc.text("Semester", leftX, y);
    doc.text(": " + (info.semester || ''), labelX, y);
    y += 20;
  
    // doc.text("Course", leftX, y);
    // doc.text(": " + (info.course || ''), labelX, y);
    // y += 30;
  
    // 4) build table rows from report.levelSummary
    const tableData = Object.entries(report.levelSummary || {}).map(
      ([domain, stats]) => [
        domain,
        stats && stats.avg != null ? stats.avg + '%' : 'Nil'
      ]
    );
  
    // 5) draw the autoTable on the doc
    autoTable(doc,{
      head: [['Domain', 'Percentage of Attainment']],
      body: tableData,
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 11 },
      headStyles: { fillColor: [33, 150, 243] },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' }
      }
    });
  
    // 6) move down to after the table
    y = doc.lastAutoTable.finalY + 30;
  
    // 7) grab your chart’s canvas and add it as an image
    const chartEl = document.getElementById('student-chart');
    if (chartEl) {
      const imgData     = chartEl.toDataURL('image/png');
      const pageWidth   = doc.internal.pageSize.getWidth();
      const chartWidth  = pageWidth - margin * 2;
      const chartHeight = (chartWidth * chartEl.height) / chartEl.width;
      doc.addImage(imgData, 'PNG', margin, y, chartWidth, chartHeight);
    }
  
    // 8) finally, save with a safe filename
    const safeName = (info.name || 'student').replace(/\W+/g,'_');
    doc.save(`Student_Report_${safeName}_${asmt.name || asmtId}.pdf`);
  };
  
  

  // Chart data
  const levels = report ? Object.entries(report.levelSummary) : [];
  const labels = levels.map(([lvl])=>lvl);
  const data   = levels.map(([, data]) => data.avg || 0);

  return (
    <div className="container py-4 text-center">
      <h2>STUDENTS' OUTCOME ATTAINMENT CARD</h2>

      <div className="row justify-content-center my-4 gx-2">
        <div className="col-auto">
          <select className="form-select" 
                  value={studentId} 
                  onChange={e=>setStudentId(e.target.value)}>
            <option value="">-- Choose Student --</option>
            {students.map(s=>
              <option key={s.id} value={s.id}>{s.name}</option>
            )}
          </select>
        </div>
        <div className="col-auto">
          <select className="form-select"
                  value={asmtId}
                  onChange={e=>setAsmtId(e.target.value)}>
            <option value="">-- Choose Assessment --</option>
            {assessments.map(a=>
              <option key={a.id} value={a.id}>
                {a.name} ({a.date})
              </option>
            )}
          </select>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary"
                  onClick={generate}
                  disabled={!studentId||!asmtId}>
            Generate Report
          </button>
        </div>
      </div>

      {report && (
        <>
          <table className="table table-bordered w-auto mx-auto">
            <thead className="table-light">
              <tr>
                <th>Domain</th>
                <th>Percentage of Attainment</th>
              </tr>
            </thead>
            <tbody>
            {levels.map(([level, data]) => (
                <tr key={level}>
                  <td>{level}</td>
                  <td>{data.avg != null ? data.avg + '%' : 'Nil'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{maxWidth:600,margin:'auto',paddingTop:20}}>
            <Bar
              id="student-chart"
              data={{
                labels,
                datasets:[{
                  label:'% Attainment',
                  data,
                  backgroundColor:'rgba(33,150,243,0.7)'
                }]
              }}
              options={{
                scales:{ y:{ beginAtZero:true, max:100 } },
                plugins:{
                  legend:{ display:false },
                  tooltip:{
                    callbacks:{ label:ctx=>ctx.parsed.y + '%' }
                  }
                }
              }}
            />
          </div>

          <button className="btn btn-secondary mt-4" onClick={downloadPDF}>
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}
