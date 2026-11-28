
import { safeExecute } from "../../../../db/config.js";

export const getUserByIdService = async (userId) => {
  const query = `
    SELECT
      user_id,
      first_name,
      last_name,
      email,
      role,
      status,
      created_at
    FROM users
    WHERE user_id = ?
    LIMIT 1
  `;

  const users = await safeExecute(query, [userId]);

  return users[0] || null;
};
