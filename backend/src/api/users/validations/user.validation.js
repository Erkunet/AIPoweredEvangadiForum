
import { body, param, query, validationResult } from "express-validator";

// Handle validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

// GET /api/users
export const getAllUsersValidation = [
  query("role")
    .optional()
    .isIn(["admin", "instructor", "student"])
    .withMessage("Invalid user role"),

  query("status")
    .optional()
    .isIn(["pending", "active", "suspended"])
    .withMessage("Invalid user status"),

  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string")
    .isLength({ max: 100 })
    .withMessage("Search cannot exceed 100 characters"),

  validateRequest,
];

// GET /api/users/:id
export const getUserByIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),

  validateRequest,
];

// PATCH /api/users/:id/role
export const updateUserRoleValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),

  body("role")
    .exists()
    .withMessage("Role is required")
    .isIn(["admin", "instructor", "student"])
    .withMessage("Role must be admin, instructor, or student"),

  validateRequest,
];

// PATCH /api/users/:id/status
export const updateUserStatusValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),

  body("status")
    .exists()
    .withMessage("Status is required")
    .isIn(["pending", "active", "suspended"])
    .withMessage("Status must be pending, active, or suspended"),

  validateRequest,
];
