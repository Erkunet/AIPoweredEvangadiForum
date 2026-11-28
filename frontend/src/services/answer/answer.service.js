
import { apiClient } from '../core/api.client.js';

const base = '/api/answers';

export const upvoteAnswer = async (answerId) => {
  const response = await apiClient.put(
    `${base}/${answerId}/vote`
  );
  return response.data;
};

export const removeAnswerVote = async (answerId) => {
  const response = await apiClient.delete(
    `${base}/${answerId}/vote`
  );
  return response.data;
};

export const getAnswerComments = async (answerId) => {
  const response = await apiClient.get(
    `${base}/${answerId}/comments`
  );
  return response.data;
};

export const postAnswerComment = async (answerId, content) => {
  const response = await apiClient.post(
    `${base}/${answerId}/comments`,
    { content }
  );
  return response.data;
};

export const updateAnswerComment = async (
  answerId,
  commentId,
  content
) => {
  const response = await apiClient.put(
    `${base}/${answerId}/comments/${commentId}`,
    { content }
  );
  return response.data;
};

export const deleteAnswerComment = async (
  answerId,
  commentId
) => {
  const response = await apiClient.delete(
    `${base}/${answerId}/comments/${commentId}`
  );
  return response.data;
};

export const updateAnswer = async (answerId, content) => {
  const response = await apiClient.put(
    `${base}/${answerId}`,
    { content }
  );
  return response.data;
};

export const deleteAnswer = async (answerId) => {
  const response = await apiClient.delete(
    `${base}/${answerId}`
  );
  return response.data;
};

export const getAnswerHistory = async (answerId) => {
  const response = await apiClient.get(
    `${base}/${answerId}/history`
  );
  return response.data;
};

export const reportAnswer = async (
  answerId,
  reason,
  description = ''
) => {
  const response = await apiClient.post(
    `${base}/${answerId}/reports`,
    { reason, description }
  );
  return response.data;
};
