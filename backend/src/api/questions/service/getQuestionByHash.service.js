
import { safeExecute } from '../../../../db/config.js';

import {
  NotFoundError,
} from '../../../utils/errors/index.js';

export const getQuestionByHashService = async (hash) => {
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
      u.last_name AS lastName
    FROM questions q
    INNER JOIN users u
      ON q.user_id = u.user_id
    WHERE q.question_hash = ?
    LIMIT 1
  `;

  const rows = await safeExecute(sql, [hash]);

  if (rows.length === 0) {
    throw new NotFoundError('Question not found.');
  }

  return rows[0];
};
