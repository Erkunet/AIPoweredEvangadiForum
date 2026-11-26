import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import { createAnswerController } from "../controller/answer.controller.js";

const router = express.Router();

router.use(authenticateUser);
router.post("/", createAnswerController);

export default router;
