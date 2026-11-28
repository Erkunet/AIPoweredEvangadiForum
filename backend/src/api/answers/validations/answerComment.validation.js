
const validId = (value) => {
  const text = String(value ?? '');

  return /^[1-9]\d*$/.test(text) &&
    Number.isSafeInteger(Number(text));
};

export const validateAnswerId = (req, res, next) => {
  if (!validId(req.params.answerId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid answer ID.',
    });
  }

  next();
};

export const validateCommentId = (req, res, next) => {
  if (!validId(req.params.commentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid comment ID.',
    });
  }

  next();
};

export const validateCommentContent = (req, res, next) => {
  const content = req.body?.content;

  if (typeof content !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Comment content must be a string.',
    });
  }

  const trimmed = content.trim();

  if (trimmed.length < 1 || trimmed.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Comment must contain 1 to 2000 characters.',
    });
  }

  req.body.content = trimmed;
  next();
};
