
import { safeExecute } from '../../../../db/config.js';
import { NotFoundError } from '../../../utils/errors/index.js';

export const getQuestionHistoryService = async ({
  hash,
  userId,
}) => {
  const questions = await safeExecute(
    `SELECT question_id, user_id, title, content
     FROM questions
     WHERE question_hash = ?
     LIMIT 1`,
    [hash]
  );

  if (questions.length > 0) {
    if (Number(questions[0].user_id) !== Number(userId)) {
      const error = new Error(
        'Only the author can view question history.'
      );
      error.statusCode = 403;
      throw error;
    }
  } else {
    // Allow history access after question deletion.
    const owners = await safeExecute(
      `SELECT user_id
       FROM question_history
       WHERE question_hash = ?
       ORDER BY history_id DESC
       LIMIT 1`,
      [hash]
    );

    if (owners.length === 0) {
      throw new NotFoundError('Question not found.');
    }

    if (Number(owners[0].user_id) !== Number(userId)) {
      const error = new Error(
        'Only the author can view question history.'
      );
      error.statusCode = 403;
      throw error;
    }
  }

  const history = await safeExecute(
    `SELECT
       history_id AS historyId,
       action,
       title,
       content,
       changed_at AS changedAt
     FROM question_history
     WHERE question_hash = ?
       AND user_id = ?
     ORDER BY history_id DESC`,
    [hash, userId]
  );

  return {
    question: questions.length > 0
      ? {
          questionHash: hash,
          title: questions[0].title,
          content: questions[0].content,
        }
      : null,
    deleted: questions.length === 0,
    history,
  };
};
