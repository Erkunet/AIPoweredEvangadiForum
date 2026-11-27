import { StatusCodes } from "http-status-codes";

import { searchQuestionsSemanticService } from "../service/question.service.js";

// ----------------------------------------------------
//  T-11: SEMANTIC SEARCH QUESTIONS
// GET /api/questions/search
// ----------------------------------------------------
/**
 * Receives the search parameters from the URL.
 *
 * query     = Search text
 * k         = Maximum number of results
 * threshold = Minimum cosine similarity
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
 * @returns {Promise<void>}
 */
export const searchQuestionsSemanticController = async (req, res, next) => {
  try {
    // Extract validated query parameters
    const { query, k, threshold } = req.query;

    // Pass parameters to the business logic service
    const result = await searchQuestionsSemanticService({
      query,
      k,
      threshold,
    });

    // Return the exact response structure required
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Semantic search completed successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};









