
import { safeExecute } from "../../../../db/config.js";
import { getUserByIdService } from "./getUserById.service.js";

export const updateUserRoleService = async (
  userId,
  role,
  adminId
) => {
  const allowedRoles = [
    "admin",
    "instructor",
    "student",
  ];

  if (!allowedRoles.includes(role)) {
    const error = new Error("Invalid user role");
    error.statusCode = 400;
    throw error;
  }

  if (Number(userId) === Number(adminId)) {
    const error = new Error(
      "You cannot change your own administrator role"
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

  if (existingUser.role === role) {
    return existingUser;
  }

  await safeExecute(
    `
      UPDATE users
      SET role = ?
      WHERE user_id = ?
    `,
    [role, userId]
  );

  return await getUserByIdService(userId);
};
