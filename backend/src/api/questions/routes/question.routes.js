// backend/src/api/questions/routes/question.routes.js
import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import {
  createQuestionController,
  listQuestionsController,
  semanticSearchController,
  draftCoachController,
  getSingleQuestionController,
  getSimilarQuestionsController,
assessAnswerAgainstQuestionController,
} from "../controller/question.controller.js";

const router = express.Router();

router.use(authenticateUser);

router.post("/", createQuestionController);
router.get("/", listQuestionsController);
router.get("/search", semanticSearchController);

// Placed BEFORE /:questionHash so "draft-coach" is matched as a literal route
router.post("/draft-coach", draftCoachController);

router.get("/:questionHash", getSingleQuestionController);
router.get("/:questionHash/similar", getSimilarQuestionsController);
// POST /api/questions/:questionHash/answer-fit -> AI answer relevance check(T-18)
router.post(
  '/:questionHash/answer-fit',
  authenticateUser,
  assessAnswerAgainstQuestionValidation,
  assessAnswerAgainstQuestionController,
);

export default router;
