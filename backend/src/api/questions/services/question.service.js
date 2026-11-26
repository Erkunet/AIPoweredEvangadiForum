// backend/src/api/questions/services/question.service.js
import crypto from "crypto";
import { db as pool } from "../../../../db/config.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors/index.js";
import { generateEmbedding, cosineSimilarity } from "../../../utils/gemini.js";
import { generateStructuredJson } from "../../../utils/gemini.js";

function generateQuestionHash() {
  return crypto.randomBytes(8).toString("hex"); // 16-char hex string matching CHAR(16)
}

// T-09: Create Question & Auto-Embed
export async function createQuestion({ userId, title, content }) {
  const trimmedTitle = title?.trim();
  const trimmedContent = content?.trim();

  if (!trimmedTitle || trimmedTitle.length < 5 || trimmedTitle.length > 255) {
    throw new BadRequestError(
      "Question title must be between 5 and 255 characters.",
    );
  }
  if (!trimmedContent || trimmedContent.length < 10) {
    throw new BadRequestError(
      "Question content must be at least 10 characters.",
    );
  }

  const questionHash = generateQuestionHash();

  const [result] = await pool.query(
    `INSERT INTO questions (question_hash, user_id, title, content)
     VALUES (?, ?, ?, ?)`,
    [questionHash, userId, trimmedTitle, trimmedContent],
  );

  const questionId = result.insertId;
  const sourceText = `${trimmedTitle}\n\n${trimmedContent}`;

  // Generate embedding and store in question_vectors
  try {
    const embedding = await generateEmbedding(sourceText);
    await pool.query(
      `INSERT INTO question_vectors (question_id, source_text, embedding, status)
       VALUES (?, ?, ?, 'ready')`,
      [questionId, sourceText, JSON.stringify(embedding)],
    );
  } catch (err) {
    console.error(
      "Embedding generation failed for question:",
      questionId,
      err.message,
    );
    await pool.query(
      `INSERT INTO question_vectors (question_id, source_text, embedding, status)
       VALUES (?, ?, ?, 'failed')`,
      [questionId, sourceText, JSON.stringify([])],
    );
  }

  return getQuestionByHash(questionHash);
}

// T-10: List Questions (with optional keyword search & ?mine=true filter)
export async function listQuestions({ search, mine, userId }) {
  const conditions = [];
  const params = [];

  if (mine === "true" || mine === true) {
    conditions.push("q.user_id = ?");
    params.push(userId);
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push("(q.title LIKE ? OR q.content LIKE ?)");
    params.push(term, term);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT
       q.question_id,
       q.question_hash,
       q.user_id,
       q.title,
       q.content,
       q.created_at,
       q.updated_at,
       u.first_name,
       u.last_name,
       COUNT(a.answer_id) AS answer_count
     FROM questions q
     JOIN users u ON q.user_id = u.user_id
     LEFT JOIN answers a ON q.question_id = a.question_id
     ${whereClause}
     GROUP BY q.question_id
     ORDER BY q.created_at DESC
     LIMIT 100`,
    params,
  );

  return rows;
}

// T-10: Get Single Question Details + All Answers
export async function getQuestionByHash(questionHash) {
  const [questionRows] = await pool.query(
    `SELECT
       q.question_id,
       q.question_hash,
       q.user_id,
       q.title,
       q.content,
       q.created_at,
       q.updated_at,
       u.first_name,
       u.last_name
     FROM questions q
     JOIN users u ON q.user_id = u.user_id
     WHERE q.question_hash = ?
     LIMIT 1`,
    [questionHash],
  );

  const question = questionRows[0];
  if (!question) {
    throw new NotFoundError("Question not found.");
  }

  const [answers] = await pool.query(
    `SELECT
       a.answer_id,
       a.question_id,
       a.user_id,
       a.content,
       a.created_at,
       a.updated_at,
       u.first_name,
       u.last_name
     FROM answers a
     JOIN users u ON a.user_id = u.user_id
     WHERE a.question_id = ?
     ORDER BY a.created_at ASC`,
    [question.question_id],
  );

  return {
    ...question,
    answers,
  };
}

// T-11: Semantic Search Questions
export async function semanticSearchQuestions(queryText, limit = 10) {
  if (!queryText || !queryText.trim()) {
    throw new BadRequestError("Search query is required.");
  }

  const queryVector = await generateEmbedding(queryText.trim());

  const [rows] = await pool.query(
    `SELECT
       q.question_id,
       q.question_hash,
       q.user_id,
       q.title,
       q.content,
       q.created_at,
       u.first_name,
       u.last_name,
       qv.embedding,
       COUNT(a.answer_id) AS answer_count
     FROM questions q
     JOIN users u ON q.user_id = u.user_id
     JOIN question_vectors qv ON q.question_id = qv.question_id
     LEFT JOIN answers a ON q.question_id = a.question_id
     WHERE qv.status = 'ready'
     GROUP BY q.question_id, qv.vector_id`,
  );

  return rows
    .map((row) => {
      const vec =
        typeof row.embedding === "string"
          ? JSON.parse(row.embedding)
          : row.embedding;
      const similarity = cosineSimilarity(queryVector, vec);
      const { embedding, ...cleanRow } = row;
      return { ...cleanRow, similarity };
    })
    .filter((item) => item.similarity > 0.35)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

// T-11: Find Similar Questions
export async function findSimilarQuestions(questionHash, limit = 5) {
  const [targetRows] = await pool.query(
    `SELECT q.question_id, qv.embedding
     FROM questions q
     JOIN question_vectors qv ON q.question_id = qv.question_id
     WHERE q.question_hash = ? AND qv.status = 'ready'
     LIMIT 1`,
    [questionHash],
  );

  if (!targetRows[0]) {
    return [];
  }

  const targetVec =
    typeof targetRows[0].embedding === "string"
      ? JSON.parse(targetRows[0].embedding)
      : targetRows[0].embedding;

  const [others] = await pool.query(
    `SELECT
       q.question_id,
       q.question_hash,
       q.title,
       q.created_at,
       u.first_name,
       u.last_name,
       qv.embedding
     FROM questions q
     JOIN users u ON q.user_id = u.user_id
     JOIN question_vectors qv ON q.question_id = qv.question_id
     WHERE q.question_hash != ? AND qv.status = 'ready'`,
    [questionHash],
  );

  return others
    .map((row) => {
      const vec =
        typeof row.embedding === "string"
          ? JSON.parse(row.embedding)
          : row.embedding;
      const similarity = cosineSimilarity(targetVec, vec);
      const { embedding, ...cleanRow } = row;
      return { ...cleanRow, similarity };
    })
    .filter((item) => item.similarity > 0.4)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

// T-17: AI Question Draft Coach
export async function coachQuestionDraft({ title = "", content = "" }) {
  const cleanTitle = title.trim();
  const cleanContent = content.trim();

  if (!cleanTitle && !cleanContent) {
    throw new BadRequestError(
      "Provide a draft title or content to get AI feedback.",
    );
  }

  return generateStructuredJson({
    systemInstruction: `You are a technical Q&A coach for Evangadi Forum (software engineering learners and mentors).
Return ONLY valid JSON with this exact shape:
{
  "summary": "1-2 sentence assessment of the draft",
  "tips": ["actionable tip 1", "actionable tip 2"],
  "suggestedTitle": "improved clear title or null",
  "missingDetails": ["repro steps", "expected vs actual behavior", "error logs", "minimal code"]
}`,
    prompt: `Review this draft question before it is posted:
Title: ${cleanTitle || "(empty)"}
Body: ${cleanContent || "(empty)"}`,
  });
}

// T-18: AI Answer Fit Evaluation
export async function evaluateAnswerFit({ questionHash, draftAnswer }) {
  const cleanDraft = draftAnswer?.trim();
  if (!cleanDraft || cleanDraft.length < 10) {
    throw new BadRequestError("Draft answer must be at least 10 characters.");
  }

  const question = await getQuestionByHash(questionHash);

  return generateStructuredJson({
    systemInstruction: `You evaluate how relevant and helpful a draft answer is for a technical forum question.
Do NOT grade correctness harshly; focus on whether it directly addresses the question's problem and context.
Return ONLY valid JSON with this exact shape:
{
  "fitScore": 0 to 100 number,
  "verdict": "strong" | "partial" | "off-target",
  "feedback": "concise explanation of how well the draft fits",
  "suggestions": ["specific improvement 1", "specific improvement 2"]
}`,
    prompt: `Question Title: ${question.title}
Question Content: ${question.content}

Draft Answer:
${cleanDraft}`,
  });
}