
import {
  getAllQuestionsService,
} from '../service/getAllQuestions.service.js';

export const getAllQuestionsController = async (
  req,
  res,
  next
) => {
  try {
    const keyword =
      typeof req.query.q === 'string'
        ? req.query.q.trim()
        : '';

    const questions = await getAllQuestionsService(keyword);

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error);
  }
};
