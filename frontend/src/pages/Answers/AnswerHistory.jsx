
import { useEffect, useState } from "react";

import {
  getAnswerHistory,
} from "../../services/answer/answer.service.js";

import styles from "../QuestionDetail/QuestionDetail.module.css";

export default function AnswerHistory({ answerId }) {
  // ======================================
  // STATES
  // ======================================

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================
  // FETCH ANSWER EDIT HISTORY
  // ======================================

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    getAnswerHistory(answerId)
      .then((response) => {
        if (!active) return;

        const data = response?.data ?? response;

        const historyList = Array.isArray(data)
          ? data
          : Array.isArray(data?.history)
            ? data.history
            : [];

        setHistory(historyList);
      })
      .catch((err) => {
        if (active) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load history."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    // Cleanup when component unmounts
    return () => {
      active = false;
    };
  }, [answerId]);

  // ======================================
  // COMPONENT UI
  // ======================================

  return (
    <section
      className={styles.answerHistoryPanel}
      aria-label="Answer edit history"
    >
      {/* SECTION TITLE */}

      <h4 className={styles.answerHistoryTitle}>
        Answer Edit History
      </h4>

      {/* ERROR MESSAGE */}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {/* LOADING STATE */}

      {loading ? (
        <p>Loading history...</p>
      ) : history.length === 0 ? (
        /* EMPTY HISTORY */
        <p className={styles.commentsEmpty}>
          No previous versions.
        </p>
      ) : (
        /* HISTORY LIST */
        history.map((item, index) => {
          const historyId =
            item.historyId ??
            item.history_id ??
            index;

          const editedAt =
            item.editedAt ??
            item.edited_at;

          const previousContent =
            item.previousContent ??
            item.previous_content ??
            "";

          return (
            <div
              className={styles.answerHistoryEntry}
              key={historyId}
            >
              {/* EDIT DATE */}

              <span className={styles.answerHistoryDate}>
                {editedAt
                  ? new Date(editedAt).toLocaleString()
                  : `Revision ${index + 1}`}
              </span>

              {/* PREVIOUS ANSWER CONTENT */}

              <p className={styles.answerHistoryContent}>
                {previousContent}
              </p>
            </div>
          );
        })
      )}
    </section>
  );
}
