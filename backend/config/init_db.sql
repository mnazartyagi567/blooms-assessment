-- backend/db/init.sql

-- 1) users w/ role
CREATE TABLE IF NOT EXISTS users (
  id        SERIAL      PRIMARY KEY,
  username  TEXT        NOT NULL UNIQUE,
  password  TEXT        NOT NULL,
  role      TEXT        NOT NULL DEFAULT 'student'
);

-- 2) questions
CREATE TABLE IF NOT EXISTS questions (
  id               SERIAL      PRIMARY KEY,
  question_no      TEXT,
  question_text    TEXT        NOT NULL,
  level            TEXT,
  keywords         TEXT,
  specification    TEXT,
  co               TEXT,
  po               TEXT
);

-- 3) students
CREATE TABLE IF NOT EXISTS students (
  id             SERIAL      PRIMARY KEY,
  name           TEXT,
  roll_no        TEXT        UNIQUE,
  program        TEXT,
  semester       INTEGER,
  academic_year  TEXT
);

-- 4) courses
CREATE TABLE IF NOT EXISTS courses (
  id             SERIAL      PRIMARY KEY,
  name           TEXT,
  code           TEXT,
  program        TEXT,
  semester       INTEGER,
  academic_year  TEXT
);

-- 5) assessments
CREATE TABLE IF NOT EXISTS assessments (
  id         SERIAL      PRIMARY KEY,
  name       TEXT,
  date       TEXT,
  course_id  INTEGER
);

-- 6) assessment_questions (with max_score + uniqueness)
CREATE TABLE IF NOT EXISTS assessment_questions (
  id             SERIAL      PRIMARY KEY,
  assessment_id  INTEGER     NOT NULL,
  question_id    INTEGER     NOT NULL,
  max_score      INTEGER     NOT NULL,
  UNIQUE (assessment_id, question_id)
);

-- 7) student_assessment_attempts (one score per student/question/assessment)
CREATE TABLE IF NOT EXISTS student_assessment_attempts (
  id             SERIAL      PRIMARY KEY,
  student_id     INTEGER,
  assessment_id  INTEGER,
  question_id    INTEGER,
  score          INTEGER,
  UNIQUE (student_id, assessment_id, question_id)
);

-- 8) Seed one instructor + one student (won’t re-insert if they already exist)
INSERT INTO users (username, password, role)
VALUES ('instructor','password','teacher')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password, role)
VALUES ('student1','password','student')
ON CONFLICT (username) DO NOTHING;
