// backend/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.serialize(() => {
  // 1) Users table (for instructor login)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  // 2) Questions table, with optional CO/PO columns
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_no TEXT,
      level TEXT,
      keywords TEXT,
      specification TEXT,
      co TEXT,       -- optional field for Course Outcome
      po TEXT        -- optional field for Program Outcome
    )
  `);

  // 3) Students table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      roll_no TEXT UNIQUE,
      program TEXT,
      semester INTEGER,
      academic_year TEXT
    )
  `);

  // 4) Courses table
  db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      code TEXT,
      program TEXT,
      semester INTEGER,
      academic_year TEXT
    )
  `);

  // 5) Assessments table (with course_id link)
  db.run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      date TEXT,
      course_id INTEGER
    )
  `);

  // 6) Join table: which questions belong to which assessment
  db.run(`
    CREATE TABLE IF NOT EXISTS assessment_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assessment_id INTEGER,
      question_id INTEGER
    )
  `);

  // 7) Aggregated grade distribution (A/B/C/D)
  db.run(`
    CREATE TABLE IF NOT EXISTS question_grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assessment_id INTEGER,
      question_id INTEGER,
      grade_a_count INTEGER DEFAULT 0,
      grade_b_count INTEGER DEFAULT 0,
      grade_c_count INTEGER DEFAULT 0,
      grade_d_count INTEGER DEFAULT 0,
      total_appeared INTEGER DEFAULT 0
    )
  `);

  // 8) Individual attempts: each student’s answer to each question
  db.run(`
    CREATE TABLE IF NOT EXISTS student_assessment_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      assessment_id INTEGER,
      question_id INTEGER,
      is_correct INTEGER
    )
  `);

  // Insert default instructor if none exist
  db.get(`SELECT COUNT(*) AS count FROM users`, (err, row) => {
    if (!err && row && row.count === 0) {
      db.run(`INSERT INTO users (username, password) VALUES (?, ?)`,
        ['instructor', 'password'],
        (err2) => {
          if (err2) console.error("Error inserting default user:", err2.message);
          else console.log("Default user 'instructor' added with password 'password'");
        }
      );
    }
  });
});

module.exports = db;
