
import { StatusCodes } from 'http-status-codes';
import {
  getQuestionHistoryService,
} from '../service/getQuestionHistory.service.js';

export const getQuestionHistoryController = async (
  req,
  res,
  next
) => {
  try {
    const result = await getQuestionHistoryService({
      hash: req.params.hash,
      userId: req.user.id,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
