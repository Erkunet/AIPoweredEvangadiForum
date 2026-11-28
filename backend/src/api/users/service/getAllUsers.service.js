
import { safeExecute } from "../../../../db/config.js";

export const getAllUsersService = async ({
  role,
  status,
  search,
} = {}) => {
  let query = `
    SELECT
      user_id,
      first_name,
      last_name,
      email,
      role,
      status,
      created_at
    FROM users
    WHERE 1 = 1
  `;

  const values = [];

  if (role) {
    query += " AND role = ?";
    values.push(role);
  }

  if (status) {
    query += " AND status = ?";
    values.push(status);
  }

  if (search) {
    query += `
      AND (
        first_name LIKE ?
        OR last_name LIKE ?
        OR email LIKE ?
      )
    `;

    const searchValue = `%${search}%`;

    values.push(
      searchValue,
      searchValue,
      searchValue
    );
  }

  query += " ORDER BY created_at DESC, user_id DESC";

  const users = await safeExecute(query, values);

  return users;
};
