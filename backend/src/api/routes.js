import express from "express";
import authRoutes from "./auth/routes/auth.routes.js";
import questionRoutes from "./questions/routes/question.routes.js";
import answerRoutes from "./answers/routes/answer.routes.js";

export const mainRouter = express.Router();

// Authentication routes
mainRouter.use("/auth", authRoutes);

// Questions routes (T-09, T-10, T-11)
mainRouter.use("/questions", questionRoutes);

// Answers routes (T-12)
mainRouter.use("/answers", answerRoutes);
