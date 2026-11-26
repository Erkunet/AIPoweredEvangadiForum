import { body } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";

export const createQuestionValidation = [
  body("title")
    .isString()
    .withMessage("Title must be text")
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage("Title must contain 5 to 255 characters"),

  body("content")
    .isString()
    .withMessage("Content must be text")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must contain at least 10 characters"),

  validationErrorHandler,
];

// export const updateQuestionValidation = [
//   body("title")
//     .isString()
//     .withMessage("Title must be text")
//     .trim()
//     .isLength({ min: 5, max: 255 })
//     .withMessage("Title must contain 5 to 255 characters"),

//   body("content")
//     .isString()
//     .withMessage("Content must be text")
//     .trim()
//     .isLength({ min: 10, max: 65535 })
//     .withMessage("Content must contain 10 to 65535 characters"),

//   validationErrorHandler,
// ];

export const generateQuestionDraftCoachValidation = [
  body("title")
    .optional()
    .isString()
    .withMessage("Question title must be a string.")
    .trim()
    .isLength({ max: 255 })
    .withMessage("Question title cannot exceed 255 characters."),

  body("content")
    .notEmpty()
    .withMessage("Question content is required.")
    .bail()
    .isString()
    .withMessage("Question content must be a string.")
    .trim()
    .notEmpty()
    .withMessage("Question content cannot be empty.")
     .trim()
    .isLength({ min: 10, max: 65535 })
    .withMessage("Content must contain 10 to 65535 characters"),
  validationErrorHandler,
];