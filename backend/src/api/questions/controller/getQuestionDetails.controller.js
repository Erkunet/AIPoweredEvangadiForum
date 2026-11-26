
import {
  getQuestionByHashService,
} from '../service/getQuestionByHash.service.js';

import {
  getQuestionAnswersService,
} from '../../answers/service/postAnswer.service.js';

export const getQuestionDetailsController = async (
  req,
  res,
  next
) => {
  try {
    const { hash } = req.params;

    const question = await getQuestionByHashService(hash);

    const answers = await getQuestionAnswersService(
      question.questionId
    );

    res.status(200).json({
      success: true,
      question: {
        ...question,
        answers,
        answerCount: answers.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
