
import express from 'express';

import {
  authenticateUser,
} from '../../../middleware/authentication.js';

import {
  createQuestionController,
} from '../controller/createQuestion.controller.js';

import {
  getMyQuestionsController,
} from '../controller/getMyQuestions.controller.js';

import {
  getAllQuestionsController,
} from '../controller/getAllQuestions.controller.js';

import {
  getQuestionDetailsController,
} from '../controller/getQuestionDetails.controller.js';

import {
  getDashboardStatsController,
} from '../controller/getDashboardStats.controller.js';

import {
  updateQuestionController,
} from '../controller/updateQuestion.controller.js';

import {
  getQuestionHistoryController,
} from '../controller/getQuestionHistory.controller.js';

import {
  createQuestionValidation,
  updateQuestionValidation,
} from '../validations/question.validation.js';

const router = express.Router();

// 1. Get all questions
router.get(
  '/',
  authenticateUser,
  getAllQuestionsController
);

// 2. Get my questions
router.get(
  '/mine',
  authenticateUser,
  getMyQuestionsController
);

// 3. Dashboard statistics
router.get(
  '/stats',
  authenticateUser,
  getDashboardStatsController
);

// 4. Create question
router.post(
  '/',
  authenticateUser,
  createQuestionValidation,
  createQuestionController
);

// 5. Get question history
router.get(
  '/:hash/history',
  authenticateUser,
  getQuestionHistoryController
);

// 6. Update question
router.put(
  '/:hash',
  authenticateUser,
  updateQuestionValidation,
  updateQuestionController
);

// 7. Get question details
router.get(
  '/:hash',
  authenticateUser,
  getQuestionDetailsController
);

export default router;
