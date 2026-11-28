
import {
  upvoteAnswerService,
  removeVoteService
} from '../service/answerVote.service.js';

export const upvoteAnswerController = async (
  req,
  res,
  next
) => {
  try {
    const result = await upvoteAnswerService(
      Number(req.params.answerId),
      req.user.id
    );

    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const removeVoteController = async (
  req,
  res,
  next
) => {
  try {
    const result = await removeVoteService(
      Number(req.params.answerId),
      req.user.id
    );

    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
