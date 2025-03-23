// src/components/assessments/AssessmentReport.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function AssessmentReport({ assessmentId }) {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    const res = await axios.get(`http://localhost:5000/api/grades/report/${assessmentId}`);
    setReportData(res.data);
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Assessment Report (ID: ${assessmentId})`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Aggregated Grades by Question`, 14, 28);

    const tableRows = reportData.data.map((row) => [
      `Q${row.question_no}`,
      row.level,
      row.grade_a_count,
      row.grade_b_count,
      row.grade_c_count,
      row.grade_d_count,
      row.total_appeared
    ]);

    doc.autoTable({
      head: [['Question', 'Level', 'A', 'B', 'C', 'D', 'Total']],
      body: tableRows,
      startY: 40
    });

    // Bloom’s-level summary
    doc.text(`Bloom's Level Summary`, 14, doc.autoTable.previous.finalY + 10);
    const summaryRows = Object.entries(reportData.summary).map(([level, vals]) => [
      level,
      vals.a,
      vals.b,
      vals.c,
      vals.d,
      vals.total
    ]);

    doc.autoTable({
      head: [['Level', 'A', 'B', 'C', 'D', 'Total']],
      body: summaryRows,
      startY: doc.autoTable.previous.finalY + 16
    });

    doc.save(`Assessment_${assessmentId}_Report.pdf`);
  };

  if (!reportData) return <p>Loading report...</p>;

  // For a simple chart, let's show total correct (A+B) vs. total lower (C+D) by Bloom’s level
  const levels = Object.keys(reportData.summary);
  const dataA = levels.map((lvl) => reportData.summary[lvl].a);
  const dataB = levels.map((lvl) => reportData.summary[lvl].b);
  const dataC = levels.map((lvl) => reportData.summary[lvl].c);
  const dataD = levels.map((lvl) => reportData.summary[lvl].d);

  const chartData = {
    labels: levels,
    datasets: [
      {
        label: 'A Count',
        data: dataA,
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
      {
        label: 'B Count',
        data: dataB,
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
      {
        label: 'C Count',
        data: dataC,
        backgroundColor: 'rgba(255, 206, 86, 0.8)',
      },
      {
        label: 'D Count',
        data: dataD,
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
    ]
  };

  return (
    <div>
      <h4>Assessment Report (ID: {assessmentId})</h4>
      <div style={{ maxWidth: '600px', marginBottom: '20px' }}>
        <Bar data={chartData} />
      </div>
      {/* <button className="btn btn-primary mb-3" onClick={handleDownloadPDF}>
        Download PDF
      </button> */}

      <h5>Detailed Question Grades</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Question</th>
            <th>Level</th>
            <th>A</th>
            <th>B</th>
            <th>C</th>
            <th>D</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {reportData.data.map((row) => (
            <tr key={row.id}>
              <td>Q{row.question_no}</td>
              <td>{row.level}</td>
              <td>{row.grade_a_count}</td>
              <td>{row.grade_b_count}</td>
              <td>{row.grade_c_count}</td>
              <td>{row.grade_d_count}</td>
              <td>{row.total_appeared}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5>Bloom’s Level Summary</h5>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Level</th>
            <th>A</th>
            <th>B</th>
            <th>C</th>
            <th>D</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(reportData.summary).map(([level, vals]) => (
            <tr key={level}>
              <td>{level}</td>
              <td>{vals.a}</td>
              <td>{vals.b}</td>
              <td>{vals.c}</td>
              <td>{vals.d}</td>
              <td>{vals.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AssessmentReport;
