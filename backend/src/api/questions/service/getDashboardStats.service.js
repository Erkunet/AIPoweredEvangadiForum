
import { safeExecute } from '../../../../db/config.js';

export const getDashboardStatsService = async (userId) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM questions) AS questions,

      (SELECT COUNT(*) FROM answers) AS replies,

      (
        SELECT COUNT(*)
        FROM questions q
        WHERE NOT EXISTS (
          SELECT 1
          FROM answers a
          WHERE a.question_id = q.question_id
        )
      ) AS unanswered,

      (
        SELECT COUNT(*)
        FROM questions
        WHERE user_id = ?
      ) AS yours
  `;

  const rows = await safeExecute(sql, [userId]);

  return rows[0];
};
