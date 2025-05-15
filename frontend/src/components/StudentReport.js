// src/components/StudentReport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function StudentReport({ studentId, assessmentId }) {
  const [report, setReport] = useState(null);

  useEffect(() => {
    axios.get(`/api/reports/student/${studentId}/${assessmentId}`)
      .then(r => setReport(r.data.levelSummary));
  }, [studentId, assessmentId]);

  if (!report) return <p>Loading your report…</p>;

  const levels = Object.keys(report);
  const rows   = levels.map(l => {
    const { totalScore, count } = report[l];
    const avg = count ? (totalScore / count).toFixed(1) : 'N/A';
    return [l, count, avg];
  });

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`My Bloom Report (Asmnt ${assessmentId})`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Student ID: ${studentId}`, 14, 28);
    doc.autoTable({
      head: [['Level','Responses','Avg Score']],
      body: rows,
      startY: 34
    });
    doc.save(`StudentRep_${studentId}_${assessmentId}.pdf`);
  };

  return (
    <div>
      <h3>My Bloom’s-Level Report</h3>
      <table className="table table-striped" style={{ maxWidth: 600 }}>
        <thead>
          <tr><th>Level</th><th>Responses</th><th>Avg Score</th></tr>
        </thead>
        <tbody>
          {rows.map(([lvl,cnt,avg]) => (
            <tr key={lvl}>
              <td>{lvl}</td><td>{cnt}</td><td>{avg}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-secondary" onClick={downloadPDF}>
        Download PDF
      </button>
    </div>
  );
}
