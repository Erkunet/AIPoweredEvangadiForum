
import express from 'express';

import authRoutes from './auth/routes/auth.routes.js';
import questionRoutes from './questions/routes/question.routes.js';
import answerRoutes from './answers/routes/answer.routes.js';

import answerInteractionRoutes from './answers/routes/answerInteraction.routes.js';

import userRoutes from "./users/routes/user.routes.js";

import reportRoutes from "./reports/routes/report.routes.js";

export const mainRouter = express.Router();

mainRouter.use('/users', userRoutes);

mainRouter.use('/auth', authRoutes);

mainRouter.use('/questions', questionRoutes);

mainRouter.use('/questions', answerRoutes);

mainRouter.use('/answers', answerInteractionRoutes);

mainRouter.use("/admin/reports", reportRoutes);