import { GoogleGenerativeAI } from "@google/generative-ai";

import { safeExecute } from "../../../../db/config.js";

import { ServiceUnavailableError } from "../../../utils/errors/index.js";

// ----------------------------------------------------
//  CONFIGURATION
// ----------------------------------------------------

const GEMINI_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const configuredThreshold = Number(process.env.RECOMMEND_THRESHOLD);
const configuredK = Number(process.env.RECOMMEND_K);

const RECOMMEND_THRESHOLD =
  process.env.RECOMMEND_THRESHOLD !== undefined &&
  Number.isFinite(configuredThreshold)
    ? configuredThreshold
    : 0.75;

const RECOMMEND_K =
  process.env.RECOMMEND_K !== undefined && Number.isInteger(configuredK)
    ? configuredK
    : 5;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const geminiEmbeddingModel = genAI.getGenerativeModel({
  model: GEMINI_EMBEDDING_MODEL,
});

// ----------------------------------------------------
//  TEXT NORMALIZATION
// ----------------------------------------------------

function normalizeWhitespace(value) {
  if (typeof value !== "string") return "";

  return value.replace(/\s+/g, " ").trim();
}

export const normalizeQuestionText = (input) => {
  if (typeof input === "string") {
    return normalizeWhitespace(input);
  }

  const title = normalizeWhitespace(input?.title || "");
  const content = normalizeWhitespace(input?.content || "");

  return normalizeWhitespace(`${title} ${content}`);
};

// ----------------------------------------------------
//  VECTOR CONFIGURATION
// ----------------------------------------------------

export const getVectorConfig = () => ({
  model: GEMINI_EMBEDDING_MODEL,
  threshold: RECOMMEND_THRESHOLD,
  defaultLimit: RECOMMEND_K,
});

// ----------------------------------------------------
//  COSINE SIMILARITY
// ----------------------------------------------------

function computeCosineSimilarity(vecA, vecB) {
  if (
    !Array.isArray(vecA) ||
    !Array.isArray(vecB) ||
    vecA.length === 0 ||
    vecA.length !== vecB.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = Number(vecA[i]);
    const b = Number(vecB[i]);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return 0;
    }

    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ----------------------------------------------------
//  GEMINI EMBEDDING GENERATION
// ----------------------------------------------------

/**
 * taskType:
 * RETRIEVAL_DOCUMENT = embedding for a saved question
 * RETRIEVAL_QUERY    = embedding for a search request
 */

export const generateQuestionEmbedding = async (
  text,
  taskType = "RETRIEVAL_DOCUMENT",
) => {
  const cleanText = normalizeWhitespace(text);

  if (!cleanText) {
    return [];
  }

  try {
    const result = await geminiEmbeddingModel.embedContent({
      content: {
        role: "user",
        parts: [{ text: cleanText }],
      },
      taskType,
    });

    const values = result?.embedding?.values;

    if (
      !Array.isArray(values) ||
      values.length === 0 ||
      !values.every(Number.isFinite)
    ) {
      throw new Error("Gemini returned an invalid embedding");
    }

    return values;
  } catch (error) {
    throw new ServiceUnavailableError(
      `Failed to generate embedding: ${error.message}`,
    );
  }
};

// ----------------------------------------------------
//  STORE QUESTION VECTOR
// ----------------------------------------------------

/**
 * Saves a question embedding.
 *
 * Database columns:
 * question_id, source_text, embedding, status
 */

export const storeQuestionVector = async ({
  questionId,
  sourceText,
  embedding,
}) => {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("A valid question embedding is required");
  }

  const serializedVector = JSON.stringify(embedding);

  const sql = `
    INSERT INTO question_vectors
      (question_id, source_text, embedding, status)
    VALUES (?, ?, ?, 'ready')
    ON DUPLICATE KEY UPDATE
      source_text = VALUES(source_text),
      embedding = VALUES(embedding),
      status = 'ready',
      updated_at = CURRENT_TIMESTAMP
  `;

  await safeExecute(sql, [questionId, sourceText, serializedVector]);
};

// ----------------------------------------------------
//  PARSE STORED VECTOR
// ----------------------------------------------------

function parseStoredVector(embedding) {
  const vector =
    typeof embedding === "string" ? JSON.parse(embedding) : embedding;

  if (
    !Array.isArray(vector) ||
    vector.length === 0 ||
    !vector.every((value) => Number.isFinite(Number(value)))
  ) {
    return null;
  }

  return vector.map(Number);
}

// ----------------------------------------------------
//  RANK SIMILAR VECTORS
// ----------------------------------------------------

async function rankSimilarVectors(
  targetEmbedding,
  {
    limit = RECOMMEND_K,
    threshold = RECOMMEND_THRESHOLD,
    excludeQuestionId = null,
  } = {},
) {
  // Retrieve only active/ready vectors
  let sql = `
    SELECT question_id, embedding
    FROM question_vectors
    WHERE status = 'ready'
  `;

  const params = [];

  // Exclude the current question for similar-question searches
  if (excludeQuestionId !== null) {
    sql += " AND question_id != ?";
    params.push(excludeQuestionId);
  }

  const rows = await safeExecute(sql, params);

  if (!rows || rows.length === 0) {
    return [];
  }

  return rows
    .map((row) => {
      const storedVector = parseStoredVector(row.embedding);

      if (!storedVector) {
        return null;
      }

      const score = computeCosineSimilarity(targetEmbedding, storedVector);

      return {
        question_id: row.question_id,
        score,
      };
    })
    .filter((item) => item !== null && item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ----------------------------------------------------
//  FIND SIMILAR QUESTIONS BY TEXT
// ----------------------------------------------------

export const findSimilarQuestionsByText = async (text, options = {}) => {
  // For a text search, use RETRIEVAL_QUERY
  const queryEmbedding = await generateQuestionEmbedding(
    text,
    "RETRIEVAL_QUERY",
  );

  if (queryEmbedding.length === 0) {
    return [];
  }

  return rankSimilarVectors(queryEmbedding, options);
};

// ----------------------------------------------------
//  FIND SIMILAR QUESTIONS BY QUESTION ID
// ----------------------------------------------------

export const findSimilarQuestionsByQuestionId = async (
  questionId,
  options = {},
) => {
  const rows = await safeExecute(
    `
      SELECT embedding
      FROM question_vectors
      WHERE question_id = ?
        AND status = 'ready'
    `,
    [questionId],
  );

  if (!rows || rows.length === 0) {
    return [];
  }

  const targetEmbedding = parseStoredVector(rows[0].embedding);

  if (!targetEmbedding) {
    return [];
  }

  return rankSimilarVectors(targetEmbedding, {
    ...options,
    excludeQuestionId: questionId,
  });
};
