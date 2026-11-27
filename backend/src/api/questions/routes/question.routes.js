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
  answerFitController,
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
router.post("/:questionHash/answer-fit", answerFitController);

export default router;
