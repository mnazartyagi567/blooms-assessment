// backend/routes/reports.js
const express = require('express')
const router  = express.Router()
const R       = require('../controllers/reportsController')

// New endpoint for attainment map
router.get('/attainment/:assessmentId', R.getAttainmentReport)

module.exports = router
