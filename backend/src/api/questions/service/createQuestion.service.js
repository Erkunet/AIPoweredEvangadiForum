
import { randomBytes } from 'node:crypto';
import { safeExecute } from '../../../../db/config.js';

export const createQuestionService = async ({
  userId,
  title,
  content,
}) => {
  const questionHash = randomBytes(8).toString('hex');

  const sql = `
    INSERT INTO questions
      (question_hash, user_id, title, content)
    VALUES (?, ?, ?, ?)
  `;

  const result = await safeExecute(sql, [
    questionHash,
    userId,
    title,
    content,
  ]);

  return {
    questionId: result.insertId,
    questionHash,
    userId,
    title,
    content,
  };
};
