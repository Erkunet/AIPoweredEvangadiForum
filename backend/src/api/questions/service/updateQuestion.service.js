
import { db } from '../../../../db/config.js';
import { NotFoundError } from '../../../utils/errors/index.js';

export const updateQuestionService = async ({
  hash,
  userId,
  title,
  content,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Lock the question while updating.
    const [questions] = await connection.execute(
      `SELECT question_id, user_id, title, content
       FROM questions
       WHERE question_hash = ?
       FOR UPDATE`,
      [hash]
    );

    if (questions.length === 0) {
      throw new NotFoundError('Question not found.');
    }

    const existing = questions[0];

    // Ownership authorization.
    if (Number(existing.user_id) !== Number(userId)) {
      const error = new Error(
        'You can only update your own questions.'
      );
      error.statusCode = 403;
      throw error;
    }

    const newTitle = title.trim();
    const newContent = content.trim();

    const changed =
      existing.title !== newTitle ||
      existing.content !== newContent;

    if (changed) {
      // Preserve the previous version.
      await connection.execute(
        `INSERT INTO question_history
          (
            question_id,
            question_hash,
            user_id,
            action,
            title,
            content
          )
         VALUES (?, ?, ?, 'updated', ?, ?)`,
        [
          existing.question_id,
          hash,
          existing.user_id,
          existing.title,
          existing.content,
        ]
      );

      // Update the existing question.
      await connection.execute(
        `UPDATE questions
         SET title = ?, content = ?
         WHERE question_id = ?`,
        [
          newTitle,
          newContent,
          existing.question_id,
        ]
      );

      // Invalidate outdated RAG embeddings.
      await connection.execute(
        `DELETE FROM question_vectors
         WHERE question_id = ?`,
        [existing.question_id]
      );
    }

    await connection.commit();

    return {
      questionId: existing.question_id,
      questionHash: hash,
      userId: existing.user_id,
      title: newTitle,
      content: newContent,
      updated: changed,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
