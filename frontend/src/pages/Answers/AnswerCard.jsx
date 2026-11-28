
import { useEffect, useState } from "react";

import {
  getAnswerComments,
  upvoteAnswer,
  removeAnswerVote,
  updateAnswer,
  deleteAnswer,
} from "../../services/answer/answer.service.js";

import AnswerComments from "./AnswerComments.jsx";
import AnswerHistory from "./AnswerHistory.jsx";
import ReportAnswer from "./ReportAnswer.jsx";

import styles from "../QuestionDetail/QuestionDetail.module.css";

export default function AnswerCard({
  answer,
  currentUser,
  onAnswerUpdated,
  onAnswerDeleted,
}) {
  // ======================================
  // ANSWER INFORMATION
  // ======================================

  const answerId = answer?.answerId ?? answer?.answer_id;

  const currentUserId =
    currentUser?.userId ??
    currentUser?.user_id ??
    currentUser?.id;

  const answerOwnerId =
    answer?.userId ?? answer?.user_id;

  const isOwner =
    currentUserId != null &&
    answerOwnerId != null &&
    String(currentUserId) === String(answerOwnerId);

  const authorName =
    [
      answer?.firstName ?? answer?.first_name,
      answer?.lastName ?? answer?.last_name,
    ]
      .filter(Boolean)
      .join(" ") || "Community Member";

  // ======================================
  // STATE
  // ======================================

  const [content, setContent] = useState(answer?.content ?? "");
  const [editContent, setEditContent] = useState(answer?.content ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [voteCount, setVoteCount] = useState(
    Number(answer?.voteCount ?? answer?.vote_count ?? 0)
  );

  const [userVote, setUserVote] = useState(
    Number(answer?.userVote ?? answer?.user_vote ?? 0)
  );

  const [voting, setVoting] = useState(false);

  const [commentCount, setCommentCount] = useState(
    Number(answer?.commentCount ?? answer?.comment_count ?? 0)
  );

  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================
  // HELPERS
  // ======================================

  const getError = (err) =>
    err?.response?.data?.message ||
    err?.response?.data?.msg ||
    err?.message ||
    "Request failed.";

  // ======================================
  // SYNC ANSWER CONTENT
  // ======================================

  useEffect(() => {
    setContent(answer?.content ?? "");
  }, [answer?.content]);

  // ======================================
  // LOAD VOTE COUNT FROM ANSWER DATA
  // ======================================

  useEffect(() => {
    setVoteCount(
      Number(answer?.voteCount ?? answer?.vote_count ?? 0)
    );

    setUserVote(
      Number(answer?.userVote ?? answer?.user_vote ?? 0)
    );
  }, [
    answer?.voteCount,
    answer?.vote_count,
    answer?.userVote,
    answer?.user_vote,
  ]);

  // ======================================
  // LOAD COMMENT COUNT FROM DATABASE
  // ======================================

  useEffect(() => {
    let active = true;

    const loadCommentCount = async () => {
      if (answerId == null) return;

      try {
        const response = await getAnswerComments(answerId);

        const data = response?.data ?? response;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.comments)
            ? data.comments
            : Array.isArray(data?.data)
              ? data.data
              : null;

        if (active && list) {
          setCommentCount(list.length);
        }
      } catch (err) {
        console.error("Unable to load comment count:", err);
      }
    };

    loadCommentCount();

    return () => {
      active = false;
    };
  }, [answerId]);

  // ======================================
  // UPVOTE / REMOVE VOTE
  // ======================================

  const handleVote = async () => {
    if (
      voting ||
      deleting ||
      saving ||
      isOwner ||
      currentUserId == null
    ) {
      return;
    }

    setVoting(true);
    setError("");
    setSuccess("");

    try {
      const alreadyVoted = Number(userVote) === 1;

      const response = alreadyVoted
        ? await removeAnswerVote(answerId)
        : await upvoteAnswer(answerId);

      const data = response?.data ?? response;

      setVoteCount((previous) => {
        if (data?.voteCount != null) {
          return Number(data.voteCount);
        }

        if (data?.vote_count != null) {
          return Number(data.vote_count);
        }

        return Math.max(
          0,
          previous + (alreadyVoted ? -1 : 1)
        );
      });

      setUserVote(
        data?.userVote != null
          ? Number(data.userVote)
          : data?.user_vote != null
            ? Number(data.user_vote)
            : alreadyVoted
              ? 0
              : 1
      );
    } catch (err) {
      setError(getError(err));
    } finally {
      setVoting(false);
    }
  };

  // ======================================
  // EDIT ANSWER
  // ======================================

  const handleEdit = () => {
    setEditContent(content);
    setEditing(true);
    setShowDeleteConfirm(false);
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    const value = editContent.trim();

    if (!value) {
      setError("Answer cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateAnswer(answerId, value);

      setContent(value);
      setEditing(false);
      setSuccess("Answer updated successfully.");

      await onAnswerUpdated?.();
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // SOFT DELETE ANSWER
  // ======================================

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      await deleteAnswer(answerId);

      setDeleted(true);
      setShowDeleteConfirm(false);

      await (onAnswerDeleted ?? onAnswerUpdated)?.();
    } catch (err) {
      setError(getError(err));
    } finally {
      setDeleting(false);
    }
  };

  // ======================================
  // HIDE SOFT-DELETED ANSWERS
  // ======================================

  if (
    !answer ||
    deleted ||
    Number(answer?.isDeleted ?? answer?.is_deleted ?? 0) === 1
  ) {
    return null;
  }

  // ======================================
  // JSX
  // ======================================

  return (
    <article className={styles.answerCard}>

      {/* ANSWER AUTHOR */}

      <div className={styles.authorRow}>
        <strong>{authorName}</strong>
      </div>

      {/* EDIT ANSWER FORM */}

      {editing ? (
        <div className={styles.answerEditForm}>
          <h3 className={styles.answerEditTitle}>
            Edit Your Answer
          </h3>

          <textarea
            className={styles.answerTextarea}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={5}
            maxLength={65535}
            disabled={saving}
          />

          <div className={styles.answerFormActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleSave}
              disabled={saving || !editContent.trim()}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        <p className={styles.answerContent}>{content}</p>
      )}

      {/* FEEDBACK */}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className={styles.success} role="status">
          {success}
        </p>
      )}

      {/* ANSWER ACTIONS */}

      <div className={styles.answerActions}>

        {/* VOTE BUTTON */}

        <button
          type="button"
          onClick={handleVote}
          disabled={
            voting ||
            saving ||
            deleting ||
            isOwner ||
            currentUserId == null
          }
          aria-pressed={Number(userVote) === 1}
        >
          {voting
            ? "Updating..."
            : Number(userVote) === 1
              ? "▲ Voted"
              : "▲ Upvote"}
          {" "}({voteCount})
        </button>

        {/* COMMENTS BUTTON */}

        <button
          type="button"
          onClick={() => setShowComments((prev) => !prev)}
          aria-expanded={showComments}
        >
          {showComments ? "Hide Comments" : "Comments"}
          {" "}({commentCount})
        </button>

        {/* ANSWER HISTORY */}

        <button
          type="button"
          onClick={() => setShowHistory((prev) => !prev)}
          aria-expanded={showHistory}
        >
          {showHistory ? "Hide History" : "History"}
        </button>

        {/* REPORT ANSWER */}

        {currentUserId != null && !isOwner && (
          <button
            type="button"
            onClick={() => setShowReport((prev) => !prev)}
            aria-expanded={showReport}
          >
            {showReport ? "Cancel Report" : "Report"}
          </button>
        )}

        {/* OWNER ACTIONS */}

        {isOwner && (
          <>
            <button
              type="button"
              onClick={handleEdit}
              disabled={editing || saving || deleting}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(true);
                setEditing(false);
              }}
              disabled={saving || deleting}
            >
              Delete
            </button>
          </>
        )}
      </div>

      {/* DELETE CONFIRMATION */}

      {showDeleteConfirm && (
        <div className={styles.deleteConfirm}>
          <h3 className={styles.deleteConfirmTitle}>
            Delete Answer?
          </h3>

          <p className={styles.deleteConfirmText}>
            Are you sure you want to delete this answer?
            It will no longer appear in the discussion.
          </p>

          <div className={styles.deleteConfirmActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </button>

            <button
              type="button"
              className={styles.dangerButton}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      )}

      {/* COMMENTS CRUD */}

      {showComments && (
        <AnswerComments
          answerId={answerId}
          currentUser={currentUser}
          onCountChange={setCommentCount}
        />
      )}

      {/* ANSWER EDIT HISTORY */}

      {showHistory && (
        <AnswerHistory answerId={answerId} />
      )}

      {/* REPORT ANSWER */}

      {showReport && (
        <ReportAnswer
          answerId={answerId}
          onClose={() => setShowReport(false)}
        />
      )}

    </article>
  );
}
