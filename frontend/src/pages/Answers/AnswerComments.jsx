
import { useEffect, useState } from "react";

import {
  getAnswerComments,
  postAnswerComment,
  updateAnswerComment,
  deleteAnswerComment,
} from "../../services/answer/answer.service.js";

import styles from "../QuestionDetail/QuestionDetail.module.css";

export default function AnswerComments({
  answerId,
  currentUser,
  onCountChange,
}) {
  // ==============================
  // STATES
  // ==============================

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const currentUserId =
    currentUser?.userId ??
    currentUser?.user_id ??
    currentUser?.id;

  // ==============================
  // HELPERS
  // ==============================

  const getCommentId = (comment) =>
    comment.commentId ?? comment.comment_id;

  const getCommentUserId = (comment) =>
    comment.userId ?? comment.user_id;

  const getError = (err) =>
    err?.response?.data?.message ||
    err?.response?.data?.msg ||
    err?.message ||
    "Something went wrong.";

  // ==============================
  // GET COMMENTS FROM DATABASE
  // ==============================

  const fetchComments = async () => {
    const response = await getAnswerComments(answerId);

    console.log("GET COMMENTS RESPONSE:", response);

    // Supports Axios responses and services
    // that already return response.data.
    let data = response;

    if (!Array.isArray(data) && data?.data !== undefined) {
      data = data.data;
    }

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.comments)
        ? data.comments
        : Array.isArray(data?.data)
          ? data.data
          : null;

    if (!list) {
      throw new Error(
        "Invalid comments API response. Check GET endpoint."
      );
    }

    setComments(list);

    onCountChange?.(list.length);
  };

  // ==============================
  // LOAD COMMENTS ON PAGE OPEN
  // ==============================

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAnswerComments(answerId);

        let data = response;

        if (!Array.isArray(data) && data?.data !== undefined) {
          data = data.data;
        }

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.comments)
            ? data.comments
            : Array.isArray(data?.data)
              ? data.data
              : null;

        if (!list) {
          throw new Error(
            "Invalid comments response from backend."
          );
        }

        if (active) {
          setComments(list);
          onCountChange?.(list.length);
        }
      } catch (err) {
        if (active) {
          setError(getError(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (answerId != null) {
      load();
    } else {
      setLoading(false);
      setError("Answer ID is missing.");
    }

    return () => {
      active = false;
    };
  }, [answerId]);

  // ==============================
  // ADD COMMENT
  // ==============================

  const handleAdd = async (e) => {
    e.preventDefault();

    const content = newComment.trim();

    if (!content || busy || currentUserId == null) return;

    setBusy(true);
    setError("");

    try {
      await postAnswerComment(answerId, content);

      // Reload saved comments from DB
      await fetchComments();

      setNewComment("");
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  // ==============================
  // EDIT COMMENT
  // ==============================

  const handleEdit = (comment) => {
    setEditId(getCommentId(comment));
    setEditText(comment.content ?? "");
    setDeleteId(null);
    setError("");
  };

  // ==============================
  // UPDATE COMMENT
  // ==============================

  const handleUpdate = async () => {
    const content = editText.trim();

    if (!content || editId == null || busy) return;

    setBusy(true);
    setError("");

    try {
      await updateAnswerComment(
        answerId,
        editId,
        content
      );

      await fetchComments();

      setEditId(null);
      setEditText("");
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  // ==============================
  // DELETE COMMENT
  // ==============================

  const handleDelete = async (commentId) => {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await deleteAnswerComment(answerId, commentId);

      await fetchComments();

      setDeleteId(null);
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  // ==============================
  // COMPONENT UI
  // ==============================

  return (
    <section className={styles.commentsSection}>

      <h4 className={styles.commentsTitle}>
        Comments ({comments.length})
      </h4>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {/* ADD COMMENT FORM */}

      {currentUserId != null ? (
        <form
          className={styles.commentForm}
          onSubmit={handleAdd}
        >
          <textarea
            className={styles.answerTextarea}
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) =>
              setNewComment(e.target.value)
            }
            maxLength={5000}
            rows={3}
            disabled={busy}
            required
          />

          <div className={styles.commentFormActions}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={busy || !newComment.trim()}
            >
              {busy ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <p className={styles.commentsEmpty}>
          Log in to post a comment.
        </p>
      )}

      {/* COMMENTS LIST */}

      {loading ? (
        <p className={styles.commentsLoading}>
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className={styles.commentsEmpty}>
          No comments yet.
        </p>
      ) : (
        <div className={styles.commentsList}>
          {comments.map((comment) => {
            const id = getCommentId(comment);

            const owner =
              currentUserId != null &&
              String(currentUserId) ===
                String(getCommentUserId(comment));

            const author =
              [
                comment.firstName ?? comment.first_name,
                comment.lastName ?? comment.last_name,
              ]
                .filter(Boolean)
                .join(" ") || "Community Member";

            return (
              <article
                key={id}
                className={styles.commentCard}
              >
                {/* COMMENT AUTHOR */}

                <div className={styles.commentHeader}>
                  <strong className={styles.commentAuthor}>
                    {author}
                  </strong>

                  {(comment.createdAt ??
                    comment.created_at) && (
                    <span className={styles.commentDate}>
                      {new Date(
                        comment.createdAt ??
                        comment.created_at
                      ).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* EDIT FORM OR COMMENT CONTENT */}

                {editId === id ? (
                  <div className={styles.commentEditForm}>
                    <textarea
                      className={styles.answerTextarea}
                      value={editText}
                      onChange={(e) =>
                        setEditText(e.target.value)
                      }
                      rows={3}
                      maxLength={5000}
                      disabled={busy}
                    />

                    <div className={styles.commentEditActions}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => setEditId(null)}
                        disabled={busy}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleUpdate}
                        disabled={busy || !editText.trim()}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={styles.commentContent}>
                    {comment.content}
                  </p>
                )}

                {/* OWNER ACTIONS */}

                {owner && editId !== id && (
                  <div className={styles.commentActions}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleEdit(comment)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setDeleteId(id);
                        setEditId(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* DELETE CONFIRMATION */}

                {owner && deleteId === id && (
                  <div
                    className={styles.commentDeleteConfirm}
                  >
                    <p>Delete this comment?</p>

                    <div className={styles.deleteConfirmActions}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => setDeleteId(null)}
                        disabled={busy}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={() => handleDelete(id)}
                        disabled={busy}
                      >
                        {busy
                          ? "Deleting..."
                          : "Yes, Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
