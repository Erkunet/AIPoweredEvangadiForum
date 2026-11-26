// backend/src/api/questions/controller/question.controller.js
import { StatusCodes } from "http-status-codes";
import * as questionService from "../services/question.service.js";
import { generateQuestionDraftCoachService } from "../service/geminiText.service.js";

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
export const generateQuestionDraftCoachController = async (req, res, next) => {
  try {
    // 1. Extract title and content from the request
    const { title, content } = req.body;

    // 2. Call the Gemini service
    const result = await generateQuestionDraftCoachService({
      title,
      content,
    });

    // 3. Return the response
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Draft suggestions generated",
      data: {
        tips: [result.feedback, ...result.suggestions],
      },
    });
  } catch (error) {
    next(error);
  }
};

export async function answerFitController(req, res, next) {
  try {
    const evaluation = await questionService.evaluateAnswerFit({
      questionHash: req.params.questionHash,
      draftAnswer: req.body.draftAnswer ?? req.body.content ?? req.body.answer,
    });
    res.status(200).json(evaluation);
  } catch (err) {
    next(err);
  }
}