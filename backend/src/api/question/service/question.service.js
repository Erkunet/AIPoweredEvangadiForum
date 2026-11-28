import { safeExecute } from "../../../../db/config.js";
import {
  findSimilarQuestionsByText,
  getVectorConfig,
  normalizeQuestionText,
} from "./vector.service.js";

// ----------------------------------------------------
//  T-11: SEMANTIC SEARCH QUESTIONS
// ----------------------------------------------------
/**
 * Performs semantic vector search across stored questions using a text query.
 *
 * @param {Object} params - Search parameters.
 * @param {string} params.query - Search text (minimum 5 chars).
 * @param {number} [params.k] - Maximum number of results (1-20).
 * @param {number} [params.threshold] - Minimum cosine similarity (0-1).
 * @returns {Promise<Object>} Matching questions and search metadata.
 */
export const searchQuestionsSemanticService = async ({ query, k, threshold }) => {
  //
  // Defensive check matching Step 1 of Logic Steps (min 5 chars)
  const trimmedQuery = typeof query === "string" ? query.trim() : "";
  if (trimmedQuery.length < 5) {
    const error = new Error("Search query must be at least 5 characters long.");
    error.statusCode = 400;
    throw error;
  }
  //
  const vectorConfig = getVectorConfig();

  // Default k = 5, min 1, max 20
  const normalizedK =
    k !== undefined && Number(k) >= 1
      ? Math.min(Math.floor(Number(k)), 20)
      : (vectorConfig.defaultLimit ?? 5);
  // Default threshold = 0.75 (0–1 range)
  const searchThreshold =
    threshold !== undefined && !Number.isNaN(Number(threshold))
      ? Number(threshold)
      : (vectorConfig.threshold ?? 0.75);

  const sourceText = normalizeQuestionText(trimmedQuery);

  // Steps 2-5: Embed query (RETRIEVAL_QUERY), fetch ready vectors, score, filter & take top K
  const rankedMatches = await findSimilarQuestionsByText(sourceText, {
    limit: normalizedK,
    threshold: searchThreshold,
  });

  if (!rankedMatches || rankedMatches.length === 0) {
    return {
      data: [],
      meta: {
        total: 0,
        k: normalizedK,
        threshold: searchThreshold,
        query: trimmedQuery,
        questionHash: null,
      },
    };
  }

  // Step 6: Fetch question and author details for the matching IDs
  const questionIds = rankedMatches.map((item) => item.question_id);
  const placeholders = questionIds.map(() => "?").join(", ");

  const sql = `
    SELECT
      q.question_id AS id,
      q.question_hash AS questionHash,
      q.title,
      q.content,
      q.created_at AS createdAt,
      q.updated_at AS updatedAt,
      u.user_id AS userId,
      u.first_name AS firstName,
      u.last_name AS lastName,
      COUNT(DISTINCT a.answer_id) AS answerCount
    FROM questions q
    JOIN users u ON u.user_id = q.user_id
    LEFT JOIN answers a ON a.question_id = q.question_id
    WHERE q.question_id IN (${placeholders})
    GROUP BY q.question_id, u.user_id
  `;

  const rows = await safeExecute(sql, questionIds);

  const questionMap = new Map(
    rows.map((row) => [
      Number(row.id),
      {
        id: row.id,
        questionHash: row.questionHash,
        title: row.title,
        content: row.content,
        answerCount: Number(row.answerCount),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: {
          id: row.userId,
          firstName: row.firstName,
          lastName: row.lastName,
        },
      },
    ]),
  );

  // Preserve descending similarity score order from rankedMatches
  const data = rankedMatches
    .map((match) => {
      const question = questionMap.get(Number(match.question_id));
      if (!question) return null;

      return {
        ...question,
        score: Number(match.score.toFixed(6)),
      };
    })
    .filter(Boolean);

  return {
    data,
    meta: {
      total: data.length,
      k: normalizedK,
      threshold: searchThreshold,
      query: trimmedQuery,
      questionHash: null,
    },
  };
};;


