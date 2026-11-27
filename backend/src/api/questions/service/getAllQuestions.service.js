
import { safeExecute } from '../../../../db/config.js';

export const getAllQuestionsService = async (keyword = '') => {
  const search = keyword.trim();

  const sql = `
    SELECT
      q.question_id AS questionId,
      q.question_hash AS questionHash,
      q.user_id AS userId,
      q.title,
      q.content,
      q.created_at AS createdAt,
      q.updated_at AS updatedAt,
      u.first_name AS firstName,
      u.last_name AS lastName,
      COUNT(a.answer_id) AS answerCount
    FROM questions q
    INNER JOIN users u
      ON q.user_id = u.user_id
    LEFT JOIN answers a
      ON q.question_id = a.question_id
    WHERE (
      ? = ''
      OR q.title LIKE ?
      OR q.content LIKE ?
    )
    GROUP BY
      q.question_id,
      q.question_hash,
      q.user_id,
      q.title,
      q.content,
      q.created_at,
      q.updated_at,
      u.first_name,
      u.last_name
    ORDER BY q.created_at DESC, q.question_id DESC
  `;

  const pattern = `%${search}%`;

  return await safeExecute(sql, [
    search,
    pattern,
    pattern,
  ]);
};
