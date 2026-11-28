
import { body, param } from 'express-validator';
import { validationErrorHandler } from '../../../middleware/validation-handler.js';

export const createAnswerValidation = [
  param('hash')
    .matches(/^[a-f0-9]{16}$/)
    .withMessage('Invalid question hash'),

  body('content')
    .isString()
    .withMessage('Answer must be text')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Answer is required')
    .isLength({ max: 65535 })
    .withMessage('Answer is too long'),

  validationErrorHandler,
];
