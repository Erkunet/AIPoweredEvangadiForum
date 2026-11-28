
import {
  getAnswerHistoryService,
} from '../service/answerHistory.service.js';

export const getAnswerHistoryController = async (
  req,
  res,
  next
) => {
  try {
    const result = await getAnswerHistoryService({
      answerId: Number(req.params.answerId),
      userId: req.user.id,
      role: req.user.role,
    });

    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
