import { db as pool } from "../../../../db/config.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../../utils/errors/index.js";

export async function createAnswer({ questionHash, userId, content }) {
  const trimmedContent = content?.trim();

  if (!questionHash?.trim()) {
    throw new BadRequestError("Question identifier is required.");
  }
  if (!trimmedContent || trimmedContent.length < 5) {
    throw new BadRequestError("Answer content must be at least 5 characters.");
  }

  const [questionRows] = await pool.query(
    `SELECT question_id, user_id
     FROM questions
     WHERE question_hash = ?
     LIMIT 1`,
    [questionHash.trim()],
  );

  const question = questionRows[0];
  if (!question) {
    throw new NotFoundError("Question not found.");
  }

  // Prevent users from answering their own question
  if (Number(question.user_id) === Number(userId)) {
    throw new ForbiddenError("You cannot answer your own question.");
  }

  const [result] = await pool.query(
    `INSERT INTO answers (question_id, user_id, content)
     VALUES (?, ?, ?)`,
    [question.question_id, userId, trimmedContent],
  );

  const [createdRows] = await pool.query(
    `SELECT
       a.answer_id,
       a.question_id,
       a.user_id,
       a.content,
       a.created_at,
       a.updated_at,
       u.first_name,
       u.last_name
     FROM answers a
     JOIN users u ON a.user_id = u.user_id
     WHERE a.answer_id = ?
     LIMIT 1`,
    [result.insertId],
  );

  return createdRows[0];
}
