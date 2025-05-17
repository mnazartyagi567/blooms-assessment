// backend/config/db.js
require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('ERROR: DATABASE_URL is not set in .env')
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }   // supabase / many PG hosts require SSL
})

/**
 * db.all(sql, [params], cb)
 * • If you pass two args (sql, cb), it will treat cb as the callback.
 * • Always returns a Promise, so you can also do db.all(...).then(...)
 */
function all (text, params, cb) {
  // shift arguments if called as all(text, cb)
  if (typeof params === 'function') {
    cb = params
    params = []
  }
  const p = pool.query(text, params)
    .then(res => {
      if (cb) cb(null, res.rows)
      return res.rows
    })
    .catch(err => {
      if (cb) cb(err, null)
      throw err
    })

  return p
}

/** same for single‐row get() */
function get (text, params, cb) {
  if (typeof params === 'function') {
    cb = params
    params = []
  }
  const p = pool.query(text, params)
    .then(res => {
      const row = res.rows[0] || null
      if (cb) cb(null, row)
      return row
    })
    .catch(err => {
      if (cb) cb(err, null)
      throw err
    })

  return p
}

/** run INSERT/UPDATE/DELETE (auto appends RETURNING id if you forget) */
function run (text, params, cb) {
  if (typeof params === 'function') {
    cb = params
    params = []
  }
  const sql = text.trim().endsWith('RETURNING id')
    ? text
    : text + ' RETURNING id'

  const p = pool.query(sql, params)
    .then(res => {
      const out = { lastID: res.rows[0].id }
      if (cb) cb(null, out)
      return out
    })
    .catch(err => {
      if (cb) cb(err, null)
      throw err
    })

  return p
}

module.exports = { all, get, run }
