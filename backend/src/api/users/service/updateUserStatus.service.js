
import { safeExecute } from "../../../../db/config.js";
import { getUserByIdService } from "./getUserById.service.js";

export const updateUserStatusService = async (
  userId,
  status,
  adminId
) => {
  const allowedStatuses = [
    "pending",
    "active",
    "suspended",
  ];

  if (!allowedStatuses.includes(status)) {
    const error = new Error("Invalid user status");
    error.statusCode = 400;
    throw error;
  }

  if (Number(userId) === Number(adminId)) {
    const error = new Error(
      "You cannot change your own account status"
    );
    error.statusCode = 403;
    throw error;
  }

  const existingUser = await getUserByIdService(userId);

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (existingUser.status === status) {
    return existingUser;
  }

  await safeExecute(
    `
      UPDATE users
      SET status = ?
      WHERE user_id = ?
    `,
    [status, userId]
  );

  return await getUserByIdService(userId);
};
