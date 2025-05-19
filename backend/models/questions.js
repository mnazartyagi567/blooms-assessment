// backend/models/questions.js
const db = require('../config/db');

exports.create = (data, callback) => {
  const {
    question_no,
    question_text,
    level,
    keywords,
    specification,
    co,
    po
  } = data;

  const sql = `
    INSERT INTO questions
      (question_no, question_text, level, keywords, specification, co, po)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  db.run(
    sql,
    [
      question_no,
      question_text,
      level,
      keywords,
      specification,
      co,
      po
    ],
    function (err) {
      callback(err, this?.lastID);
    }
  );
};

exports.getAll = (callback) => {
  db.all(`SELECT * FROM questions ORDER BY question_no`, [], callback);
};

// ** DELETE a question + all its mappings & attempts **
exports.delete = (id, callback) => {
  // 1) delete any student scores for that question
  db.run(
    `DELETE FROM student_assessment_attempts WHERE question_id = $1`,
    [id],
    err => {
      if (err) return callback(err);
      // 2) delete any assessment→question links
      db.run(
        `DELETE FROM assessment_questions WHERE question_id = $1`,
        [id],
        err2 => {
          if (err2) return callback(err2);
          // 3) finally delete the question itself
          db.run(
            `DELETE FROM questions WHERE id = $1`,
            [id],
            callback
          );
        }
      );
    }
  );
};

// ** UPDATE an existing question **
exports.update = (id, data, callback) => {
  const {
    question_no,
    question_text,
    level,
    keywords,
    specification,
    co,
    po
  } = data;

  const sql = `
    UPDATE questions
       SET question_no    = $1,
           question_text  = $2,
           level          = $3,
           keywords       = $4,
           specification  = $5,
           co             = $6,
           po             = $7
     WHERE id = $8
  `;
  db.run(
    sql,
    [question_no, question_text, level, keywords, specification, co, po, id],
    callback
  );
};
