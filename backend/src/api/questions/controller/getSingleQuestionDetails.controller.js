export async function getQuestionByHash(questionHash) {
  const [questionRows] = await pool.query(
    `SELECT
       q.question_id,
       q.question_hash,
       q.user_id,
       q.title,
       q.content,
       q.created_at,
       q.updated_at,
       u.first_name,
       u.last_name
     FROM questions q
     JOIN users u ON q.user_id = u.user_id
     WHERE q.question_hash = ?
     LIMIT 1`,
    [questionHash],
  );

  const question = questionRows[0];
  if (!question) {
    throw new NotFoundError("Question not found.");
  }

  const [answers] = await pool.query(
    `SELECT
       a.answer_id,
       a.question_id,
       a.user_id,
       a.content,
       a.created_at,
       a.updated_at,
       u.first_name,
       u.last_name
     FROM answers a
     JOIN users u ON a.user_id = u.user_id
     WHERE a.question_id = ?
     ORDER BY a.created_at ASC`,
    [question.question_id],
  );

  return {
    ...question,
    answers,
  };
}
