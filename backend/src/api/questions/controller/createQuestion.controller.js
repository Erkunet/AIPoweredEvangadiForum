
import { StatusCodes } from 'http-status-codes';

import {
  createQuestionService,
} from '../service/createQuestion.service.js';

export const createQuestionController = async (
  req,
  res,
  next
) => {
  try {
    const { title, content } = req.body;

    const question = await createQuestionService({
      userId: req.user.id,
      title,
      content,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Question posted successfully.',
      question,
    });
  } catch (error) {
    next(error);
  }
};
