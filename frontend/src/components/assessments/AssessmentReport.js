// frontend/src/components/assessments/AssessmentReport.jsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Bar } from 'react-chartjs-2'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// register Chart.js category scale
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
  const [rows, setRows] = useState([])

  useEffect(() => {
    axios
      .get(`/api/reports/attainment/${assessmentId}`)
      .then(r => setRows(r.data.attainment))
      .catch(console.error)
  }, [assessmentId])

  if (!rows.length) {
    return <p>Loading report…</p>
  }

  // build table data and also aggregate pass% by level
  const levels = {}
  rows.forEach(r => {
    // tally per-level totals
    if (!levels[r.level]) {
      levels[r.level] = { pass: 0, tot: 0 }
    }
    // pass = excellent + veryGood + good
    levels[r.level].pass += (r.excellent + r.veryGood + r.good)
    levels[r.level].tot  += r.total
  })

  // prepare chart
  // prepare chart
const chartLabels = Object.keys(levels)

// replace your current chartData with this:
const chartData = {
  labels: chartLabels,
  datasets: [{
    // make this a human‐readable string instead of an array
    label: 'Total Attainments',
    data: chartLabels.map(l => levels[l].tot || 0),
    backgroundColor: 'rgba(33,150,243,0.7)'
  }]
}

// add these options to force integer y-axis and a clean tooltip
const chartOptions = {
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        // force whole numbers only
        callback: v => Number(v).toFixed(0)
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        // show just the raw count in the hover
        label: ctx => `${ctx.parsed.y}`
      }
    }
  },
  maintainAspectRatio: false
}

  // PDF export: table + chart
  const downloadPDF = () => {
    const doc = new jsPDF('p','pt','a4')
    doc.setFontSize(18)
    doc.text('Course Outcome Attainment Map', 40, 40)
    doc.setFontSize(12)
    doc.text(`Assessment #${assessmentId}`, 40, 60)

    // table
    const head = [[
      'Q No','Level','Spec',
      'Excellent','Very Good','Good','Not Sat','Total'
    ]]
    const body = rows.map(r => [
      r.questionNo,
      r.level,
      r.spec,
      r.excellent,
      r.very_good,
      r.good,
      r.not_satisfactory,
      r.total
    ])
    autoTable(doc,{
      head, body,
      startY: 80,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33,150,243] }
    })

    // chart below
    doc.addPage()
    const chartCanvas = document
      .getElementById('attainment-chart')
      .toDataURL('image/png',1.0)
    doc.addImage(chartCanvas, 'PNG', 40, 60, 520, 300)

    doc.save(`AttainmentMap_${assessmentId}.pdf`)
  }

  return (
    <div>
      <h3>Course Outcome Attainment Map</h3>

      <table className="table table-sm">
        <thead className="table-primary">
          <tr>
            <th>Q No</th><th>Level</th><th>Spec</th>
            <th>Excellent</th><th>Very Good</th>
            <th>Good</th><th>Not Satisfactory</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.questionNo}>
              <td>{r.questionNo}</td>
              <td>{r.level}</td>
              <td>{r.spec}</td>
              <td>{r.excellent}</td>
              <td>{r.very_good}</td>
     <td>{r.good}</td>
    <td>{r.not_satisfactory}</td>
              <td>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{maxWidth:600}}>
        <Bar
          id="attainment-chart"
          options={chartOptions}
          data={chartData}
        />
      </div>

      <button className="btn btn-secondary mt-3" onClick={downloadPDF}>
        Download PDF
      </button>
    </div>
  )
}
