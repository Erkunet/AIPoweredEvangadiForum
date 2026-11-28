import { query } from "express-validator";

import { validationErrorHandler } from "../../../middleware/validation-handler.js";

// ----------------------------------------------------
//  T-11: SEMANTIC SEARCH QUESTIONS VALIDATION
// GET /api/questions/search
// ----------------------------------------------------
/**
 * Validates query parameters for semantic search.
 *
 * query     = Required string, 5-500 characters
 * k         = Optional integer, 1-20
 * threshold = Optional float, 0-1
 */
export const searchQuestionsSemanticValidation = [
  // 1. Validate search query
  query("query")
    .exists({ checkFalsy: true })
    .withMessage("Search query is required")
    .bail()
    .isString()
    .withMessage("Search query must be a string")
    .bail()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Search query must be between 5 and 500 characters"),

  //  Validate optional K
  query("k")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("K must be an integer between 1 and 20")
    .toInt(),

  //  Validate optional threshold
  query("threshold")
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage("Threshold must be a number between 0 and 1")
    .toFloat(),

  //  Stop if any validation rule fails
  validationErrorHandler,
];
