
import {
  getMyQuestionsService,
} from '../service/getMyQuestions.service.js';

export const getMyQuestionsController = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const questions = await getMyQuestionsService(userId);

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error);
  }
};
