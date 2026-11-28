
import { safeExecute } from '../../../../db/config.js';

export const upvoteAnswerService = async (
  answerId,
  userId
) => {
  const answers = await safeExecute(
    `SELECT answer_id, user_id, moderation_status
     FROM answers
     WHERE answer_id = ?
     LIMIT 1`,
    [answerId]
  );

  if (!answers.length) {
    return { status: 404, message: 'Answer not found.' };
  }

  if (answers[0].moderation_status !== 'visible') {
    return { status: 403, message: 'Answer is unavailable.' };
  }

  if (Number(answers[0].user_id) === Number(userId)) {
    return {
      status: 403,
      message: 'You cannot vote on your own answer.'
    };
  }

  await safeExecute(
    `INSERT INTO answer_votes
       (answer_id, user_id, vote_value)
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE vote_value = 1`,
    [answerId, userId]
  );

  const rows = await safeExecute(
    `SELECT COUNT(*) AS voteCount
     FROM answer_votes
     WHERE answer_id = ?`,
    [answerId]
  );

  return {
    status: 200,
    success: true,
    voteCount: Number(rows[0].voteCount),
    userVote: 1
  };
};

export const removeVoteService = async (
  answerId,
  userId
) => {
  await safeExecute(
    `DELETE FROM answer_votes
     WHERE answer_id = ? AND user_id = ?`,
    [answerId, userId]
  );

  const rows = await safeExecute(
    `SELECT COUNT(*) AS voteCount
     FROM answer_votes
     WHERE answer_id = ?`,
    [answerId]
  );

  return {
    status: 200,
    success: true,
    voteCount: Number(rows[0].voteCount),
    userVote: 0
  };
};
