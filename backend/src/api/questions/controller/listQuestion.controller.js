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
