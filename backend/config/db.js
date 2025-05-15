// backend/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
// Delete existing DB file on startup if you want a truly fresh start
// require('fs').unlinkSync(dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.serialize(() => {
  // 1) Users table w/ role
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student'
    )
  `);

  // 2) Questions
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_no TEXT,
      level TEXT,
      keywords TEXT,
      specification TEXT,
      co TEXT,
      po TEXT
    )
  `);

  // 3) Students
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

  // 4) Courses
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

  // 5) Assessments
  db.run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      date TEXT,
      course_id INTEGER
    )
  `);

  // 6) Map questions→assessments
  db.run(`
    CREATE TABLE IF NOT EXISTS assessment_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assessment_id INTEGER,
      question_id INTEGER
    )
  `);

  // 7) Student attempts
  db.run(`
    CREATE TABLE IF NOT EXISTS student_assessment_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      assessment_id INTEGER,
      question_id INTEGER,
      is_correct INTEGER
    )
  `);

  // Seed default instructor + student
  db.get(`SELECT COUNT(*) AS cnt FROM users`, (e, row) => {
    if (!e && row.cnt === 0) {
      const stmt = db.prepare(
        `INSERT INTO users (username,password,role) VALUES (?,?,?)`
      );
      stmt.run('instructor', 'password', 'teacher');
      stmt.run('student1', 'password', 'student');
      stmt.finalize(() =>
        console.log("Seeded users: instructor/teacher + student1/student")
      );
    }
  });
});

module.exports = db;
