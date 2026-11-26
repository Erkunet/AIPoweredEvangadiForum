import * as answerService from "../services/answer.service.js";

export async function createAnswerController(req, res, next) {
  try {
    const answer = await answerService.createAnswer({
      questionHash: req.body.questionHash ?? req.body.question_hash,
      userId: req.user.id,
      content: req.body.content,
    });
    res.status(201).json({ answer });
  } catch (err) {
    next(err);
  }
}
