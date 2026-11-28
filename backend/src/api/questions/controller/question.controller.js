// backend/src/api/questions/controller/question.controller.js
import * as questionService from "../services/question.service.js";

export async function createQuestionController(req, res, next) {
  try {
    const question = await questionService.createQuestion({
      userId: req.user.id,
      title: req.body.title,
      content: req.body.content,
    });
    res.status(201).json({ question });
  } catch (err) {
    next(err);
  }
}

export async function listQuestionsController(req, res, next) {
  try {
    const questions = await questionService.listQuestions({
      search: req.query.search,
      mine: req.query.mine,
      userId: req.user.id,
    });
    res.status(200).json({ questions });
  } catch (err) {
    next(err);
  }
}

export async function semanticSearchController(req, res, next) {
  try {
    const questions = await questionService.semanticSearchQuestions(
      req.query.q,
    );
    res.status(200).json({ questions });
  } catch (err) {
    next(err);
  }
}

export async function getSingleQuestionController(req, res, next) {
  try {
    const question = await questionService.getQuestionByHash(
      req.params.questionHash,
    );
    res.status(200).json({ question });
  } catch (err) {
    next(err);
  }
}


export async function getSimilarQuestionsController(req, res, next) {
  try {
    const questions = await questionService.findSimilarQuestions(
      req.params.questionHash,
    );
    res.status(200).json({ questions });
  } catch (err) {
    next(err);
  }
}

export async function draftCoachController(req, res, next) {
  try {
    const feedback = await questionService.coachQuestionDraft({
      title: req.body.title,
      content: req.body.content,
    });
    res.status(200).json(feedback);
  } catch (err) {
    next(err);
  }
}

export const assessAnswerAgainstQuestionController = async (
  req,
  res,
  next,
) => {
  try {
    const { questionHash } = req.params;
    const { answerText } = req.body;

    // Load the question so the AI can compare the draft against it
    const { question } = await questionService.getSingleQuestionService({ questionHash });

    const data = await questionService.assessAnswerAgainstQuestionService({
      questionTitle: question.title,
      questionContent: question.content,
      answerText,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Answer fit assessed.',
      data,
    });
  } catch (error) {
    next(error);
  }
};
