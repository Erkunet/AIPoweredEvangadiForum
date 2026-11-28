
import {
  deleteAnswerService,
} from '../service/deleteAnswer.service.js';

export const deleteAnswerController = async (
  req,
  res,
  next
) => {
  try {
    const result = await deleteAnswerService({
      answerId: Number(req.params.answerId),
      userId: req.user.id,
    });

    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
