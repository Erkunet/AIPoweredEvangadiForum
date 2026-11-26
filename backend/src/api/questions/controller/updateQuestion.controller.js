
import { StatusCodes } from 'http-status-codes';
import {
  updateQuestionService,
} from '../service/updateQuestion.service.js';

export const updateQuestionController = async (
  req,
  res,
  next
) => {
  try {
    const question = await updateQuestionService({
      hash: req.params.hash,
      userId: req.user.id,
      title: req.body.title,
      content: req.body.content,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: question.updated
        ? 'Question updated successfully.'
        : 'No changes were made.',
      question,
    });
  } catch (error) {
    next(error);
  }
};
