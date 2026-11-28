
import { safeExecute } from '../../../../db/config.js';

const fail = (status, message) => ({
  status,
  success: false,
  message,
});

const getAnswer = async (answerId) => {
  const rows = await safeExecute(
    `SELECT answer_id, moderation_status
     FROM answers
     WHERE answer_id = ?
     LIMIT 1`,
    [answerId]
  );

  return rows[0] || null;
};

const getComment = async (commentId, answerId) => {
  const rows = await safeExecute(
    `SELECT
       c.comment_id AS commentId,
       c.answer_id AS answerId,
       c.user_id AS userId,
       c.content,
       c.created_at AS createdAt,
       c.updated_at AS updatedAt,
       u.first_name AS firstName,
       u.last_name AS lastName
     FROM answer_comments c
     INNER JOIN users u ON u.user_id = c.user_id
     WHERE c.comment_id = ?
       AND c.answer_id = ?
     LIMIT 1`,
    [commentId, answerId]
  );

  return rows[0] || null;
};

// GET: all comments for one answer
export const getAnswerCommentsService = async (answerId) => {
  const answer = await getAnswer(answerId);

  if (!answer || answer.moderation_status !== 'visible') {
    return fail(404, 'Answer not found.');
  }

  const comments = await safeExecute(
    `SELECT
       c.comment_id AS commentId,
       c.answer_id AS answerId,
       c.user_id AS userId,
       c.content,
       c.created_at AS createdAt,
       c.updated_at AS updatedAt,
       u.first_name AS firstName,
       u.last_name AS lastName
     FROM answer_comments c
     INNER JOIN users u ON u.user_id = c.user_id
     WHERE c.answer_id = ?
     ORDER BY c.created_at ASC, c.comment_id ASC`,
    [answerId]
  );

  return {
    status: 200,
    success: true,
    comments,
  };
};

// POST: create a comment
export const createAnswerCommentService = async ({
  answerId,
  userId,
  content,
}) => {
  const answer = await getAnswer(answerId);

  if (!answer || answer.moderation_status !== 'visible') {
    return fail(404, 'Answer not found.');
  }

  const result = await safeExecute(
    `INSERT INTO answer_comments
       (answer_id, user_id, content)
     VALUES (?, ?, ?)`,
    [answerId, userId, content]
  );

  const comment = await getComment(result.insertId, answerId);

  return {
    status: 201,
    success: true,
    message: 'Comment posted successfully.',
    comment,
  };
};

// PUT: edit a comment
export const updateAnswerCommentService = async ({
  answerId,
  commentId,
  userId,
  role,
  content,
}) => {
  const answer = await getAnswer(answerId);

  if (!answer || answer.moderation_status !== 'visible') {
    return fail(404, 'Answer not found.');
  }

  const comment = await getComment(commentId, answerId);

  if (!comment) {
    return fail(404, 'Comment not found.');
  }

  const isOwner = Number(comment.userId) === Number(userId);
  const isAdmin = role === 'admin';

  if (!isOwner && !isAdmin) {
    return fail(403, 'You cannot edit this comment.');
  }

  await safeExecute(
    `UPDATE answer_comments
     SET content = ?, updated_at = CURRENT_TIMESTAMP
     WHERE comment_id = ? AND answer_id = ?`,
    [content, commentId, answerId]
  );

  return {
    status: 200,
    success: true,
    message: 'Comment updated successfully.',
    comment: await getComment(commentId, answerId),
  };
};

// DELETE: remove a comment
export const deleteAnswerCommentService = async ({
  answerId,
  commentId,
  userId,
  role,
}) => {
  const answer = await getAnswer(answerId);

  if (!answer || answer.moderation_status !== 'visible') {
    return fail(404, 'Answer not found.');
  }

  const comment = await getComment(commentId, answerId);

  if (!comment) {
    return fail(404, 'Comment not found.');
  }

  const isOwner = Number(comment.userId) === Number(userId);
  const isAdmin = role === 'admin';

  if (!isOwner && !isAdmin) {
    return fail(403, 'You cannot delete this comment.');
  }

  await safeExecute(
    `DELETE FROM answer_comments
     WHERE comment_id = ? AND answer_id = ?`,
    [commentId, answerId]
  );

  return {
    status: 200,
    success: true,
    message: 'Comment deleted successfully.',
  };
};
