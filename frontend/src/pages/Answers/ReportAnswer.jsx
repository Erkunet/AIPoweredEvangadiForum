
import { useState } from "react";

import {
  reportAnswer,
} from "../../services/answer/answer.service.js";

import styles from "../QuestionDetail/QuestionDetail.module.css";

// ======================================
// REPORT REASONS
// ======================================

const reasons = [
  "spam",
  "incorrect",
  "harassment",
  "inappropriate",
  "plagiarism",
  "other",
];

export default function ReportAnswer({ answerId, onClose }) {
  // ======================================
  // STATES
  // ======================================

  const [reason, setReason] = useState("spam");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  // ======================================
  // SUBMIT REPORT
  // ======================================

  const submit = async (event) => {
    event.preventDefault();

    if (busy || sent) return;

    setBusy(true);
    setError("");

    try {
      await reportAnswer(
        answerId,
        reason,
        description.trim()
      );

      setSent(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.msg ||
          err?.message ||
          "Unable to submit report."
      );
    } finally {
      setBusy(false);
    }
  };

  // ======================================
  // COMPONENT UI
  // ======================================

  return (
    <section
      className={styles.reportForm}
      aria-label="Report answer"
    >
      {/* SECTION TITLE */}

      <h4 className={styles.reportTitle}>
        Report Answer
      </h4>

      {/* ERROR MESSAGE */}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {/* SUCCESS MESSAGE */}

      {sent ? (
        <>
          <p className={styles.success} role="status">
            Report submitted for review.
          </p>

          <div className={styles.reportFormActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </>
      ) : (
        /* REPORT FORM */

        <form onSubmit={submit}>
          {/* REPORT REASON */}

          <label
            className={styles.reportLabel}
            htmlFor={`report-reason-${answerId}`}
          >
            Reason
          </label>

          <select
            className={styles.reportSelect}
            id={`report-reason-${answerId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={busy}
            required
          >
            {reasons.map((item) => (
              <option key={item} value={item}>
                {item[0].toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>

          {/* REPORT DESCRIPTION */}

          <label
            className={styles.reportLabel}
            htmlFor={`report-description-${answerId}`}
          >
            Description (optional)
          </label>

          <textarea
            className={styles.reportTextarea}
            id={`report-description-${answerId}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Explain your concern..."
            disabled={busy}
          />

          {/* FORM ACTION BUTTONS */}

          <div className={styles.reportFormActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={busy}
            >
              {busy ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
