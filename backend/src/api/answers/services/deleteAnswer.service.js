
import { safeExecute } from '../../../../db/config.js';

const failure = (status, message) => ({
  status,
  success: false,
  message,
});

export const deleteAnswerService = async ({
  answerId,
  userId,
}) => {
  const rows = await safeExecute(
    `SELECT answer_id, user_id, is_deleted
     FROM answers
     WHERE answer_id = ?
     LIMIT 1`,
    [answerId]
  );

  if (!rows.length) {
    return failure(404, 'Answer not found.');
  }

  const answer = rows[0];

  if (Number(answer.user_id) !== Number(userId)) {
    return failure(403, 'You can only delete your own answer.');
  }

  if (Number(answer.is_deleted) === 1) {
    return failure(409, 'Answer is already deleted.');
  }

  const result = await safeExecute(
    `UPDATE answers
     SET is_deleted = 1,
         deleted_at = CURRENT_TIMESTAMP
     WHERE answer_id = ?
       AND user_id = ?
       AND is_deleted = 0`,
    [answerId, userId]
  );

  if (result.affectedRows === 0) {
    return failure(409, 'Answer was already deleted.');
  }

  return {
    status: 200,
    success: true,
    message: 'Answer deleted successfully.',
    answerId,
  };
};
