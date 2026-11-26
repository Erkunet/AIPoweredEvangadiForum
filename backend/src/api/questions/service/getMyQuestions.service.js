
import { safeExecute } from '../../../../db/config.js';

export const getMyQuestionsService = async (userId) => {
  const sql = `
    SELECT
      question_id AS questionId,
      question_hash AS questionHash,
      user_id AS userId,
      title,
      content,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM questions
    WHERE user_id = ?
    ORDER BY created_at DESC, question_id DESC
  `;

  const questions = await safeExecute(sql, [userId]);

  return questions;
};
