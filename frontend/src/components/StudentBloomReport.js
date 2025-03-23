// src/components/StudentBloomReport.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function StudentBloomReport({ studentId, assessmentId }) {
  // If you want to dynamically select them, create local states:
  const [allStudents, setAllStudents] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(studentId || '');
  const [selectedAssessment, setSelectedAssessment] = useState(assessmentId || '');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchAssessments();
  }, []);

  const fetchStudents = async () => {
    const res = await axios.get('http://localhost:5000/api/students');
    setAllStudents(res.data.students);
  };

  const fetchAssessments = async () => {
    const res = await axios.get('http://localhost:5000/api/assessments');
    setAllAssessments(res.data.assessments);
  };

  const fetchReport = async () => {
    if (!selectedStudent || !selectedAssessment) {
      alert('Select both student and assessment.');
      return;
    }
    const res = await axios.get(
      `http://localhost:5000/api/attempts/report/${selectedStudent}/${selectedAssessment}`
    );
    setReportData(res.data.levelSummary);
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Student Bloom's-Level Report`, 14, 20);
    doc.setFontSize(12);
    doc.text(
      `Student ID: ${selectedStudent} | Assessment ID: ${selectedAssessment}`,
      14,
      28
    );

    const rows = Object.keys(reportData).map((lvl) => {
      const { correct, total } = reportData[lvl];
      const percent = total > 0 ? ((correct / total) * 100).toFixed(1) + '%' : 'N/A';
      return [lvl, correct, total, percent];
    });

    doc.autoTable({
      head: [['Level', 'Correct', 'Total', 'Percentage']],
      body: rows,
      startY: 40
    });

    doc.save(`Student_${selectedStudent}_Assessment_${selectedAssessment}_BloomReport.pdf`);
  };

  return (
    <div>
      <h4>Student Bloom's-Level Report</h4>
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label className="form-label">Select Student</label>
          <select
            className="form-select"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">-- Choose Student --</option>
            {allStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (Roll: {s.roll_no})
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Select Assessment</label>
          <select
            className="form-select"
            value={selectedAssessment}
            onChange={(e) => setSelectedAssessment(e.target.value)}
          >
            <option value="">-- Choose Assessment --</option>
            {allAssessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.date || 'No Date'})
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button className="btn btn-primary w-100" onClick={fetchReport}>
            Fetch Report
          </button>
        </div>
      </div>

      {!reportData && <p>Select student & assessment, then click "Fetch Report".</p>}

      {reportData && (
        <>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Level</th>
                <th>Correct</th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(reportData).map(([lvl, val]) => {
                const { correct, total } = val;
                const percent = total > 0 ? ((correct / total) * 100).toFixed(1) + '%' : 'N/A';
                return (
                  <tr key={lvl}>
                    <td>{lvl}</td>
                    <td>{correct}</td>
                    <td>{total}</td>
                    <td>{percent}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* <button className="btn btn-secondary" onClick={handleDownloadPDF}>
            Download PDF
          </button> */}
        </>
      )}
    </div>
  );
}

export default StudentBloomReport;
