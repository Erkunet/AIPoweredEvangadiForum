import express from "express";

// ----------------------------------------------------
//  IMPORT CONTROLLERS
// ----------------------------------------------------

import { searchQuestionsSemanticController } from "../controller/question.controller.js";

// ----------------------------------------------------
//  IMPORT VALIDATION MIDDLEWARE
// ----------------------------------------------------

import { searchQuestionsSemanticValidation } from "../validations/question.validation.js";

// ----------------------------------------------------
//  IMPORT AUTHENTICATION MIDDLEWARE
// ----------------------------------------------------

import { authenticateUser } from "../../../middleware/authentication.js";

// ----------------------------------------------------
//  INITIALIZE EXPRESS ROUTER
// ----------------------------------------------------

const router = express.Router();

// ----------------------------------------------------
//  T-11: SEMANTIC SEARCH QUESTIONS
// ----------------------------------------------------
/**
 * @route GET /api/questions/search
 * @desc Semantic search for questions using vector embeddings based on a text query
 * @access Protected
 */
router.get(
  "/search",
  authenticateUser,
  searchQuestionsSemanticValidation,
  searchQuestionsSemanticController,
);

// ----------------------------------------------------
//  EXPORT ROUTER
// ----------------------------------------------------

export default router;










