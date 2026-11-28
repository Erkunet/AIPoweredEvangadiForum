
import {
  updateAnswerService,
} from '../service/updateAnswer.service.js';

export const updateAnswerController = async (
  req,
  res,
  next
) => {
  try {
    const result = await updateAnswerService({
      answerId: Number(req.params.answerId),
      userId: req.user.id,
      content: req.body.content,
    });

    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
