
const isValidId = (value) => {
  const text = String(value ?? '');

  return /^[1-9]\d*$/.test(text) &&
    Number.isSafeInteger(Number(text));
};

export const validateAnswerId = (req, res, next) => {
  if (!isValidId(req.params.answerId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid answer ID.',
    });
  }

  next();
};

export const validateAnswerUpdate = (req, res, next) => {
  const content = req.body?.content;

  if (typeof content !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Answer content must be a string.',
    });
  }

  const trimmed = content.trim();

  if (trimmed.length < 1 || trimmed.length > 10000) {
    return res.status(400).json({
      success: false,
      message: 'Answer must contain 1 to 10000 characters.',
    });
  }

  req.body.content = trimmed;
  next();
};
