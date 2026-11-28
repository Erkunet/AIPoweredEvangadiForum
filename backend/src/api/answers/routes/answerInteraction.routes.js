
import express from 'express';

import {
  authenticateUser,
} from '../../../middleware/authentication.js';

import {
  upvoteAnswerController,
  removeVoteController,
} from '../controller/answerVote.controller.js';

import {
  getAnswerCommentsController,
  createAnswerCommentController,
  updateAnswerCommentController,
  deleteAnswerCommentController,
} from '../controller/answerComment.controller.js';

import {
  validateAnswerId,
  validateCommentId,
  validateCommentContent,
} from '../validations/answerComment.validation.js';


import {
  updateAnswerController,
} from '../controller/updateAnswer.controller.js';

import {
  deleteAnswerController,
} from '../controller/deleteAnswer.controller.js';

import {
  getAnswerHistoryController,
} from '../controller/answerHistory.controller.js';

import {
  validateAnswerId as validateManagedAnswerId,
  validateAnswerUpdate,
} from '../validations/answerUpdate.validation.js';



const router = express.Router();

// ======================================
// VOTING ROUTES
// ======================================

router.put(
  '/:answerId/vote',
  authenticateUser,
  validateAnswerId,
  upvoteAnswerController
);

router.delete(
  '/:answerId/vote',
  authenticateUser,
  validateAnswerId,
  removeVoteController
);

// ======================================
// COMMENT ROUTES
// ======================================

// View comments
router.get(
  '/:answerId/comments',
  authenticateUser,
  validateAnswerId,
  getAnswerCommentsController
);

// Add comment
router.post(
  '/:answerId/comments',
  authenticateUser,
  validateAnswerId,
  validateCommentContent,
  createAnswerCommentController
);

// Edit comment
router.put(
  '/:answerId/comments/:commentId',
  authenticateUser,
  validateAnswerId,
  validateCommentId,
  validateCommentContent,
  updateAnswerCommentController
);

// Delete comment
router.delete(
  '/:answerId/comments/:commentId',
  authenticateUser,
  validateAnswerId,
  validateCommentId,
  deleteAnswerCommentController
);


// Edit own answer
router.put(
  '/:answerId',
  authenticateUser,
  validateManagedAnswerId,
  validateAnswerUpdate,
  updateAnswerController
);

// Soft-delete own answer
router.delete(
  '/:answerId',
  authenticateUser,
  validateManagedAnswerId,
  deleteAnswerController
);

// View answer edit history
router.get(
  '/:answerId/history',
  authenticateUser,
  validateManagedAnswerId,
  getAnswerHistoryController
);


export default router;
