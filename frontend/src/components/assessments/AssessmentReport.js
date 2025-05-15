// src/components/assessments/AssessmentReport.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AssessmentReport({ assessmentId }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axios.get(`/api/reports/class/${assessmentId}`)
      .then(r => setSummary(r.data.classSummary));
  }, [assessmentId]);

  if (!summary) return <p>Loading report…</p>;

  const labels = Object.keys(summary);
  const data   = labels.map(l => {
    const { totalScore, count } = summary[l];
    return count ? (totalScore / count).toFixed(1) : 0;
  });

  const chartData = {
    labels,
    datasets: [{
      label: 'Avg Score by Level',
      data,
      backgroundColor: 'rgba(33, 150, 243,0.5)'
    }]
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Class Bloom Report (Assessment ${assessmentId})`, 14, 20);
    const rows = labels.map(l => {
      const { totalScore, count } = summary[l];
      const avg = count ? (totalScore / count).toFixed(1) : 'N/A';
      return [l, count, avg];
    });
    doc.autoTable({
      head: [['Level','Responses','Avg Score']],
      body: rows,
      startY: 30
    });
    doc.save(`Class_Report_Ass${assessmentId}.pdf`);
  };

  return (
    <div>
      <h3>Class Summary</h3>
      <div style={{ maxWidth: 600 }}>
        <Bar data={chartData} />
      </div>
      <button className="btn btn-secondary mt-3" onClick={downloadPDF}>
        Download PDF
      </button>
    </div>
  );
}
