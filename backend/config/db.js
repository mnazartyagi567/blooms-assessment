// backend/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const dbPath  = path.resolve(__dirname, 'database.sqlite');

// (Re)create fresh DB each run if you like; comment out if not:
// require('fs').unlinkSync(dbPath);

const db = new sqlite3.Database(dbPath, err => {
  if (err) console.error("DB open error:", err.message);
  else       console.log("Connected to SQLite DB.");
});

db.serialize(() => {
  // users w/ role
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student'
    )
  `);

  // questions
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_no TEXT,
      question_text TEXT NOT NULL,
      level TEXT,
      keywords TEXT,
      specification TEXT,
      co TEXT,
      po TEXT
    )
  `);

  // students
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

  // courses
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

  // assessments
  // db.run(`DROP TABLE IF EXISTS assessments`);
  db.run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      date TEXT,
      course_id INTEGER
    )
  `);

  // map questions→assessments
  // db.run(`DROP TABLE IF EXISTS assessment_questions`);

  db.run(`
    CREATE TABLE IF NOT EXISTS assessment_questions (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      assessment_id  INTEGER NOT NULL,
      question_id    INTEGER NOT NULL,
      max_score      INTEGER NOT NULL,
      UNIQUE(assessment_id, question_id)
    )
  `);

  // **student_assessment_attempts** now holds a numeric score
  // db.run(`DROP TABLE IF EXISTS student_assessment_attempts`);

  db.run(`
    CREATE TABLE IF NOT EXISTS student_assessment_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      assessment_id INTEGER,
      question_id INTEGER,
      score INTEGER,
      UNIQUE(student_id, assessment_id, question_id)
    )
  `);

  // seed one teacher + one student
  db.get(`SELECT COUNT(*) AS cnt FROM users`, (e, row) => {
    if (!e && row.cnt === 0) {
      db.run(`INSERT INTO users (username,password,role) VALUES (?,?,?)`,
        ['instructor','password','teacher']);
      db.run(`INSERT INTO users (username,password,role) VALUES (?,?,?)`,
        ['student1','password','student']);
      console.log("Seeded users.");
    }
  });
});

module.exports = db;
