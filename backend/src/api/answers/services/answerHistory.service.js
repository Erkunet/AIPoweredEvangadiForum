
import { safeExecute } from '../../../../db/config.js';

export const getAnswerHistoryService = async ({
  answerId,
  userId,
  role,
}) => {
  const rows = await safeExecute(
    `SELECT answer_id, user_id, is_deleted
     FROM answers
     WHERE answer_id = ?
     LIMIT 1`,
    [answerId]
  );

  if (!rows.length) {
    return {
      status: 404,
      success: false,
      message: 'Answer not found.',
    };
  }

  const answer = rows[0];

  const isOwner = Number(answer.user_id) === Number(userId);
  const isAdmin = role === 'admin';

  if (!isOwner && !isAdmin) {
    return {
      status: 403,
      success: false,
      message: 'You cannot view this answer history.',
    };
  }

  const history = await safeExecute(
    `SELECT
       h.history_id AS historyId,
       h.answer_id AS answerId,
       h.edited_by AS editedBy,
       h.previous_content AS previousContent,
       h.edited_at AS editedAt,
       u.first_name AS firstName,
       u.last_name AS lastName
     FROM answer_history h
     INNER JOIN users u ON u.user_id = h.edited_by
     WHERE h.answer_id = ?
     ORDER BY h.edited_at DESC, h.history_id DESC`,
    [answerId]
  );

  return {
    status: 200,
    success: true,
    answerId,
    history,
  };
};
