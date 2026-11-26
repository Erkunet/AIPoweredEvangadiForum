// backend/src/utils/gemini.js
const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
const DEFAULT_TEXT_MODEL = "gemini-2.5-flash";

export async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  const embeddingModel =
    process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${embeddingModel}:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${embeddingModel}`,
      content: {
        parts: [{ text }],
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini embedding failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

export function cosineSimilarity(vecA, vecB) {
  if (
    !Array.isArray(vecA) ||
    !Array.isArray(vecB) ||
    vecA.length !== vecB.length
  ) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export async function generateStructuredJson({ systemInstruction, prompt }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const textModel = process.env.GEMINI_TEXT_MODEL || DEFAULT_TEXT_MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${textModel}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Gemini text generation failed (${response.status}): ${errText}`,
    );
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Empty response from Gemini text model");
  }

  return JSON.parse(rawText);
}
