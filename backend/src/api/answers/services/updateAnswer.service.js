
import { db } from '../../../../db/config.js';

const failure = (status, message) => ({
  status,
  success: false,
  message,
});

export const updateAnswerService = async ({
  answerId,
  userId,
  content,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT
         answer_id,
         user_id,
         content,
         is_deleted,
         moderation_status
       FROM answers
       WHERE answer_id = ?
       FOR UPDATE`,
      [answerId]
    );

    if (!rows.length) {
      await connection.rollback();
      return failure(404, 'Answer not found.');
    }

    const answer = rows[0];

    if (Number(answer.user_id) !== Number(userId)) {
      await connection.rollback();
      return failure(403, 'You can only edit your own answer.');
    }

    if (
      Number(answer.is_deleted) === 1 ||
      answer.moderation_status !== 'visible'
    ) {
      await connection.rollback();
      return failure(409, 'This answer cannot be edited.');
    }

    if (answer.content.trim() === content) {
      await connection.rollback();
      return failure(409, 'No changes detected.');
    }

    // Save the previous version.
    await connection.execute(
      `INSERT INTO answer_history
         (answer_id, edited_by, previous_content)
       VALUES (?, ?, ?)`,
      [answerId, userId, answer.content]
    );

    // Update the current answer.
    await connection.execute(
      `UPDATE answers
       SET content = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE answer_id = ?`,
      [content, answerId]
    );

    const [updatedRows] = await connection.execute(
      `SELECT
         answer_id AS answerId,
         question_id AS questionId,
         user_id AS userId,
         content,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM answers
       WHERE answer_id = ?
       LIMIT 1`,
      [answerId]
    );

    await connection.commit();

    return {
      status: 200,
      success: true,
      message: 'Answer updated successfully.',
      answer: updatedRows[0],
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
