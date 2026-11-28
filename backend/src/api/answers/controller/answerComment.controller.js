
import {
  getAnswerCommentsService,
  createAnswerCommentService,
  updateAnswerCommentService,
  deleteAnswerCommentService,
} from '../service/answerComment.service.js';

export const getAnswerCommentsController = async (
  req,
  res,
  next
) => {
  try {
    const result = await getAnswerCommentsService(
      Number(req.params.answerId)
    );

    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const createAnswerCommentController = async (
  req,
  res,
  next
) => {
  try {
    const result = await createAnswerCommentService({
      answerId: Number(req.params.answerId),
      userId: req.user.id,
      content: req.body.content,
    });

    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAnswerCommentController = async (
  req,
  res,
  next
) => {
  try {
    const result = await updateAnswerCommentService({
      answerId: Number(req.params.answerId),
      commentId: Number(req.params.commentId),
      userId: req.user.id,
      role: req.user.role,
      content: req.body.content,
    });

    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteAnswerCommentController = async (
  req,
  res,
  next
) => {
  try {
    const result = await deleteAnswerCommentService({
      answerId: Number(req.params.answerId),
      commentId: Number(req.params.commentId),
      userId: req.user.id,
      role: req.user.role,
    });

    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};
