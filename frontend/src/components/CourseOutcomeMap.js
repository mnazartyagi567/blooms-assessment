// src/components/CourseOutcomeMap.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function CourseOutcomeMap({ assessmentId }) {
  const [report, setReport] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/reports/assessment/${assessmentId}/course-report`)
      .then(res => setReport(res.data))
      .catch(console.error);
  }, [assessmentId]);

  if (!report) return <p>Loading...</p>;

  const { meta, questions, domainSummary } = report;

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    // 1) Letterhead
    doc.setFontSize(12);
    doc.text('XXXX COLLEGE OF ARTS AND SCIENCES', 40, 40);
    doc.text('MMM UNIVERSITY, NEW INDIA', 40, 56);
    doc.setFontSize(18);
    doc.text('COURSE OUTCOME ATTAINMENT MAP', 40, 100);

    // 2) Course metadata
    doc.setFontSize(12);
    doc.text(`Name of the Tutor: ${meta.tutor_name || '---'}`, 40, 140);
    doc.text(`Programme: ${meta.program}`, 40, 158);
    doc.text(`Semester: ${meta.semester}`, 300, 158);
    doc.text(`Course: ${meta.course_name}`, 40, 176);

    // 3) Question‐wise table
    const qBody = questions.map(q => [
      q.question_no,
      q.level,
      q.specification,
      q.grade_a_count,
      q.grade_b_count,
      q.grade_c_count,
      q.grade_d_count,
      q.total_appeared
    ]);

    doc.autoTable({
      head: [[
        'Q No','Level','Specification',
        'Excellent','Very Good','Good','Not Satisfactory','Total'
      ]],
      body: qBody,
      startY: 200,
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 60 },
        2: { cellWidth: 80 },
        3: { cellWidth: 50 },
        4: { cellWidth: 60 },
        5: { cellWidth: 40 },
        6: { cellWidth: 60 },
        7: { cellWidth: 40 }
      }
    });

    // 4) Domain summary table, below
    const dRows = Object.entries(domainSummary).map(([lvl, pct]) => [lvl, `${pct}%`]);
    doc.autoTable({
      head: [['Domain','% Attainment']],
      body: dRows,
      startY: doc.lastAutoTable.finalY + 20,
      theme: 'grid'
    });

    doc.save(`Course_${meta.course_name}_Map.pdf`);
  };

  return (
    <div>
      <h3>Course Outcome Map Preview</h3>
      <p><strong>Course:</strong> {report.meta.course_name}</p>
      <p><strong>Programme:</strong> {report.meta.program}, <strong>Sem:</strong> {report.meta.semester}</p>

      <h5 className="mt-4">Question-Wise Distribution</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Q No</th><th>Level</th><th>Spec</th>
            <th>Excellent</th><th>Very Good</th>
            <th>Good</th><th>Not Satisfactory</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          {questions.map(q => (
            <tr key={q.question_no}>
              <td>{q.question_no}</td>
              <td>{q.level}</td>
              <td>{q.specification}</td>
              <td>{q.grade_a_count}</td>
              <td>{q.grade_b_count}</td>
              <td>{q.grade_c_count}</td>
              <td>{q.grade_d_count}</td>
              <td>{q.total_appeared}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5 className="mt-4">Domain-Level Summary</h5>
      <table className="table table-striped w-50">
        <thead><tr><th>Domain</th><th>%</th></tr></thead>
        <tbody>
          {Object.entries(domainSummary).map(([lvl,pct]) => (
            <tr key={lvl}><td>{lvl}</td><td>{pct}%</td></tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-primary mt-3" onClick={downloadPDF}>
        Download PDF
      </button>
    </div>
  );
}
