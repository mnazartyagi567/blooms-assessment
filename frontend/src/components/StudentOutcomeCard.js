// src/components/StudentOutcomeCard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function StudentOutcomeCard({ studentId, assessmentId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/reports/student/${studentId}/assessment/${assessmentId}`)
      .then(res => setData(res.data))
      .catch(console.error);
  }, [studentId, assessmentId]);

  if (!data) return <p>Loading...</p>;

  const { student, attainment } = data;

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    // 1) Letterhead
    doc.setFontSize(12);
    doc.text('XXXX COLLEGE OF ARTS AND SCIENCES', 40, 40);
    doc.text('MMM UNIVERSITY, NEW INDIA', 40, 56);
    doc.setFontSize(18);
    doc.text('STUDENTS’ OUTCOME ATTAINMENT CARD', 40, 100);

    // 2) Metadata
    doc.setFontSize(12);
    doc.text(`Name of the Candidate: ${student.name}`, 40, 140);
    doc.text(`Programme: ${student.program}`, 40, 158);
    doc.text(`Semester: ${student.semester}`, 300, 158);
    doc.text(`Course: ${student.course_name}`, 40, 176);

    // 3) Table of percentages
    const rows = Object.entries(attainment).map(([lvl, pct]) => [lvl, `${pct}%`]);
    doc.autoTable({
      head: [['Domain', 'Percentage of Attainment']],
      body: rows,
      startY: 200,
      theme: 'grid'
    });

    doc.save(`Student_${student.name}_Card.pdf`);
  };

  return (
    <div>
      <h3>Student Outcome Card Preview</h3>
      <p><strong>Name:</strong> {student.name}</p>
      <p><strong>Programme:</strong> {student.program}</p>
      <p><strong>Semester:</strong> {student.semester}</p>
      <p><strong>Course:</strong> {student.course_name}</p>

      <table className="table table-striped w-50">
        <thead><tr><th>Domain</th><th>%</th></tr></thead>
        <tbody>
          {Object.entries(attainment).map(([lvl,pct]) => (
            <tr key={lvl}><td>{lvl}</td><td>{pct}%</td></tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-primary" onClick={downloadPDF}>
        Download PDF
      </button>
    </div>
  );
}
