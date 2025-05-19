// backend/models/feedback.js
const db = require('../config/db');

exports.getFeedback = (assessment_id, student_id, cb) => {
  const sql = `
    SELECT id, feedback
      FROM feedbacks
     WHERE assessment_id = $1
       AND (${ student_id ? 'student_id = $2' : 'student_id IS NULL' })
  `;
  const params = student_id
    ? [assessment_id, student_id]
    : [assessment_id];
  db.get(sql, params, cb);
};

exports.upsertFeedback = (assessment_id, student_id, feedback, cb) => {
    if (student_id == null) {
        // 1) Try to update any existing assessment-level feedback first
        const upd = `
          UPDATE feedbacks
             SET feedback = $1,
                 updated_at = NOW()
           WHERE assessment_id = $2
             AND student_id IS NULL
           RETURNING id
        `;
        return db.get(upd, [feedback, assessment_id], (err, row) => {
          if (err) return cb(err);
          if (row) {
            // found & updated → done
            return cb(null, row);
          }
          // 2) No existing row → insert new one
          const ins = `
            INSERT INTO feedbacks (assessment_id, student_id, feedback)
            VALUES ($1, NULL, $2)
            RETURNING id
          `;
          return db.get(ins, [assessment_id, feedback], cb);
        });
      }
    
      // Non-null student_id: your old upsert works fine
      const sql = `
        INSERT INTO feedbacks (assessment_id, student_id, feedback, updated_at)
          VALUES ($1, $2, $3, NOW())
        ON CONFLICT (assessment_id, student_id)
          DO UPDATE
             SET feedback   = EXCLUDED.feedback,
                 updated_at = NOW()
        RETURNING id
      `;
      db.get(sql, [assessment_id, student_id, feedback], cb);
};

exports.deleteFeedback = (assessment_id, student_id, cb) => {
  const sql = `
    DELETE FROM feedbacks
     WHERE assessment_id = $1
       AND (${ student_id ? 'student_id = $2' : 'student_id IS NULL' })
  `;
  const params = student_id
    ? [assessment_id, student_id]
    : [assessment_id];
  db.run(sql, params, cb);
};
