import { apiClient as api } from "../core/api.client"; // Replace `apiClient` b/c the export has a different name

/**
 * Request AI Draft Coach feedback on a question draft before posting.
 * Endpoint: POST /api/questions/draft-coach
 */
export const generateQuestionDraftCoach = async ({ title, content }) => {
  const response = await api.post("/api/questions/draft-coach", {
    title,
    content,
  });                                
 return response.data;
};

/**
 * Publish a new question to the forum.
 * Endpoint: POST /api/questions
 */
export const createQuestion = async ({ title, content }) => {
  const response = await api.post("/api/questions", {
    title,
    content,
  });
  return response.data;
};
