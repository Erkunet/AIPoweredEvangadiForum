import { apiClient } from "../core/api.client.js";

async function getQuestions({ search = "", mine = false } = {}) {
  const params = {};
  if (search.trim()) params.search = search.trim();
  if (mine) params.mine = "true";

  const { data } = await apiClient.get("/api/questions", { params });
  return data.questions || [];
}

async function semanticSearch(query) {
  const { data } = await apiClient.get("/api/questions/search", {
    params: { q: query.trim() },
  });
  return data.questions || [];
}

async function getQuestionByHash(questionHash) {
  const { data } = await apiClient.get(`/api/questions/${questionHash}`);
  return data.question;
}

async function getSimilarQuestions(questionHash) {
  const { data } = await apiClient.get(
    `/api/questions/${questionHash}/similar`,
  );
  return data.questions || [];
}

async function createQuestion({ title, content }) {
  const { data } = await apiClient.post("/api/questions", { title, content });
  return data.question;
}

async function coachDraft({ title = "", content = "" }) {
  const { data } = await apiClient.post("/api/questions/draft-coach", {
    title,
    content,
  });
  return data;
}

async function postAnswer({ questionHash, content }) {
  const { data } = await apiClient.post("/api/answers", {
    questionHash,
    content,
  });
  return data.answer;
}

async function checkAnswerFit({ questionHash, draftAnswer }) {
  const { data } = await apiClient.post(
    `/api/questions/${questionHash}/answer-fit`,
    { draftAnswer },
  );
  return data;
}

export const questionService = {
  getQuestions,
  semanticSearch,
  getQuestionByHash,
  getSimilarQuestions,
  createQuestion,
  coachDraft,
  postAnswer,
  checkAnswerFit,
};
