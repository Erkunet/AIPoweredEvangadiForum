
import express from "express";

import { authenticateUser } from "../../../middleware/authentication.js";
import { authorizeRoles } from "../../../middleware/authorization.js";

import { getAllUsersController } from "../controller/getAllUsers.controller.js";
import { getUserByIdController } from "../controller/getUserById.controller.js";
import { updateUserRoleController } from "../controller/updateUserRole.controller.js";
import { updateUserStatusController } from "../controller/updateUserStatus.controller.js";

import {
  getAllUsersValidation,
  getUserByIdValidation,
  updateUserRoleValidation,
  updateUserStatusValidation,
} from "../validations/user.validation.js";

const router = express.Router();

// All user management endpoints require an active admin
router.use(authenticateUser);
router.use(authorizeRoles("admin"));

// Get all registered users
router.get(
  "/",
  getAllUsersValidation,
  getAllUsersController
);

// Get a specific user
router.get(
  "/:id",
  getUserByIdValidation,
  getUserByIdController
);

// Update a user's role
router.patch(
  "/:id/role",
  updateUserRoleValidation,
  updateUserRoleController
);

// Update a user's account status
router.patch(
  "/:id/status",
  updateUserStatusValidation,
  updateUserStatusController
);

export default router;
