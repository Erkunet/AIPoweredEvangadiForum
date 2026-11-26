import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bold,
  Italic,
  Code,
  Link2,
  Sparkles,
  Send,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  createQuestion,
  generateQuestionDraftCoach,
} from "../../services/question/question.service";
import styles from "./PostQuestion.module.css";

const PostQuestion = () => {
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    content: "",
  });

  // Submission & AI Coach states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCoaching, setIsCoaching] = useState(false);
  const [error, setError] = useState("");
  const [createdQuestion, setCreatedQuestion] = useState(null);

  // AI Draft Coach state
  const [showCoach, setShowCoach] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState(null);

  const isBusy = isSubmitting || isCoaching;

  // Validate title (5-255 chars) & content (min 10 chars)
  const validateForm = (data = formData) => {
    const errors = { title: "", content: "" };
    const trimmedTitle = data.title.trim();
    const trimmedContent = data.content.trim();

    if (trimmedTitle.length < 5) {
      errors.title = "Question title must be at least 5 characters";
    } else if (trimmedTitle.length > 255) {
      errors.title = "Question title must not exceed 255 characters";
    }

    if (trimmedContent.length < 10) {
      errors.content = "Question content must be at least 10 characters";
    }

    setFieldErrors(errors);
    return !errors.title && !errors.content;
  };

  // Handle input changes and clear individual field errors once fixed
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error) setError("");

    if (name === "title" && fieldErrors.title && value.trim().length >= 5) {
      setFieldErrors((prev) => ({ ...prev, title: "" }));
    }
    if (
      name === "content" &&
      fieldErrors.content &&
      value.trim().length >= 10
    ) {
      setFieldErrors((prev) => ({ ...prev, content: "" }));
    }
  };

  // Markdown toolbar helper for Bold, Italic, Code, and Link formatting
  const applyMarkdown = (type) => {
    const textarea = textareaRef.current;
    if (!textarea || isBusy) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selected = text.slice(start, end);

    let formatted = "";
    let cursorOffset = 0;

    switch (type) {
      case "bold":
        formatted = `**${selected || "bold text"}**`;
        cursorOffset = selected ? formatted.length : 2;
        break;
      case "italic":
        formatted = `*${selected || "italic text"}*`;
        cursorOffset = selected ? formatted.length : 1;
        break;
      case "code":
        formatted = selected.includes("\n")
          ? `\`\`\`\n${selected}\n\`\`\``
          : `\`${selected || "code"}\``;
        cursorOffset = selected ? formatted.length : 1;
        break;
      case "link":
        formatted = `[${selected || "link text"}](https://)`;
        cursorOffset = selected ? formatted.length - 1 : 1;
        break;
      default:
        return;
    }

    const updatedContent = text.slice(0, start) + formatted + text.slice(end);

    setFormData((prev) => ({ ...prev, content: updatedContent }));
    if (fieldErrors.content && updatedContent.trim().length >= 10) {
      setFieldErrors((prev) => ({ ...prev, content: "" }));
    }

    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + cursorOffset;
      textarea.setSelectionRange(pos, pos);
    });
  };

  // AI Draft Coach handler
  const handleGetAiFeedback = async () => {
    setError("");
    if (!validateForm()) return;

    setIsCoaching(true);
    try {
      const response = await generateQuestionDraftCoach({
        title: formData.title.trim(),
        content: formData.content.trim(),
      });

      // Normalize response whether backend returns { tips: [...] } or { data: { tips: [...] } }
      const payload = response?.data || response;
      setCoachFeedback({
        summary:
          payload?.summary ||
          payload?.feedback ||
          "Here are AI suggestions to make your question easier to answer in one pass:",
        tips: Array.isArray(payload?.tips)
          ? payload.tips
          : Array.isArray(payload?.suggestions)
            ? payload.suggestions
            : [],
      });
      setShowCoach(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to generate AI suggestions. Please try again.",
      );
    } finally {
      setIsCoaching(false);
    }
  };

  // Submit question handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await createQuestion({
        title: formData.title.trim(),
        content: formData.content.trim(),
      });

      const savedQuestion = response?.question || response?.data || response;
      setCreatedQuestion(savedQuestion);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to post question. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form for "Ask Another" action
  const handleAskAnother = () => {
    setFormData({ title: "", content: "" });
    setFieldErrors({ title: "", content: "" });
    setError("");
    setCoachFeedback(null);
    setShowCoach(false);
    setCreatedQuestion(null);
  };

  const questionIdentifier =
    createdQuestion?.question_hash ||
    createdQuestion?.hash ||
    createdQuestion?.question_id ||
    createdQuestion?.id;

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>ASK THE COHORT</span>
        <h1 className={styles.pageTitle}>Publish to the forum</h1>
        <p className={styles.pageSubtitle}>
          Public threads help the whole cohort. Write as if a classmate will
          debug your issue tomorrow. They only know what you put on the page.
        </p>
      </header>

      {/* SUCCESS STATE (post-question-success.png) */}
      {createdQuestion ? (
        <section className={styles.successCard} aria-live="polite">
          <div className={styles.successIconWrapper}>
            <CheckCircle2 className={styles.successIcon} strokeWidth={2.2} />
          </div>
          <h2 className={styles.successTitle}>Thread published</h2>
          <p className={styles.successDescription}>
            Your post is indexed for keyword search and embedding-based
            similarity. Share the link in study groups, or stay on the thread to
            answer follow-up questions from peers.
          </p>

          <div className={styles.successActions}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                navigate(
                  questionIdentifier
                    ? `/questions/${questionIdentifier}`
                    : "/dashboard",
                )
              }
            >
              View Question
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleAskAnother}
            >
              Ask Another
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* Guidelines Card */}
          <section className={styles.guidelinesCard}>
            <h2 className={styles.guidelinesHeading}>
              Write questions people can answer in one pass
            </h2>
            <p className={styles.guidelinesIntro}>
              Mentors volunteer their time. Give them runnable context, expected
              vs actual behavior, and a tight scope so they can reproduce the
              issue without guessing your setup.
            </p>

            <h3 className={styles.guidelinesSubheading}>
              Checklist before you post
            </h3>
            <ul className={styles.guidelinesList}>
              <li>
                <strong>Title as a headline</strong> that states the symptom and
                tech stack (e.g., “React 19: state resets after navigation”).
              </li>
              <li>
                <strong>Repro steps</strong> numbered, with environment (OS,
                browser, Node version) when it matters.
              </li>
              <li>
                <strong>Minimal code</strong> in fenced markdown blocks; trim
                unrelated lines so readers scan faster.
              </li>
              <li>
                <strong>Exact errors</strong> copied verbatim, including stack
                trace snippets when debugging backend routes.
              </li>
            </ul>

            <h3 className={styles.guidelinesSubheading}>
              Validation rules (enforced by the form)
            </h3>
            <ul className={styles.guidelinesList}>
              <li>
                <strong>Title length:</strong> Must be between 5 and 255
                characters.
              </li>
              <li>
                <strong>Body length:</strong> Must contain a minimum of 10
                characters detailing your problem.
              </li>
              <li>
                <strong>Single topic:</strong> Split unrelated bugs into
                separate threads so search and embeddings stay precise.
              </li>
            </ul>
          </section>

          {/* Form Card */}
          <section className={styles.formCard}>
            {/* Server/API Error Banner (post-question-error.png) */}
            {error && (
              <div className={styles.errorBanner} role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Title Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="question-title" className={styles.fieldLabel}>
                  Title
                </label>
                <p className={styles.fieldHelper}>
                  Be specific and imagine you&apos;re asking a question to
                  another person.
                </p>
                <input
                  id="question-title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isBusy}
                  placeholder="e.g. How do I handle state management using Context API in React?"
                  className={`${styles.titleInput} ${
                    fieldErrors.title ? styles.inputError : ""
                  }`}
                />
                {fieldErrors.title && (
                  <p className={styles.validationText}>{fieldErrors.title}</p>
                )}
              </div>

              {/* Content / Details Field */}
              <div className={styles.fieldGroup}>
                <label htmlFor="question-content" className={styles.fieldLabel}>
                  What are the details of your problem?
                </label>
                <p className={styles.fieldHelper}>
                  Introduce the problem and expand on what you put in the title.
                  Minimum 10 characters.
                </p>

                <div
                  className={`${styles.editorWrapper} ${
                    fieldErrors.content ? styles.editorError : ""
                  }`}
                >
                  <div className={styles.editorToolbar}>
                    <div className={styles.toolbarButtons}>
                      <button
                        type="button"
                        className={styles.toolbarBtn}
                        onClick={() => applyMarkdown("bold")}
                        disabled={isBusy}
                        title="Bold"
                        aria-label="Bold"
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.toolbarBtn}
                        onClick={() => applyMarkdown("italic")}
                        disabled={isBusy}
                        title="Italic"
                        aria-label="Italic"
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.toolbarBtn}
                        onClick={() => applyMarkdown("code")}
                        disabled={isBusy}
                        title="Code"
                        aria-label="Code"
                      >
                        <Code size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.toolbarBtn}
                        onClick={() => applyMarkdown("link")}
                        disabled={isBusy}
                        title="Insert Link"
                        aria-label="Insert Link"
                      >
                        <Link2 size={14} />
                      </button>
                    </div>
                    <span className={styles.charCount}>
                      {formData.content.length} characters
                    </span>
                  </div>

                  <textarea
                    ref={textareaRef}
                    id="question-content"
                    name="content"
                    rows={9}
                    value={formData.content}
                    onChange={handleChange}
                    disabled={isBusy}
                    placeholder="Include all the information someone would need to answer your question... You can use Markdown to format your code!"
                    className={styles.contentTextarea}
                  />
                </div>

                {fieldErrors.content && (
                  <p className={styles.validationText}>{fieldErrors.content}</p>
                )}
              </div>

              {/* AI Suggestions Trigger Row */}
              <div className={styles.aiTriggerRow}>
                <button
                  type="button"
                  className={styles.aiButton}
                  onClick={handleGetAiFeedback}
                  disabled={isBusy}
                >
                  <Sparkles size={15} />
                  <span>
                    {isCoaching ? "Analyzing draft..." : "AI suggestions"}
                  </span>
                </button>
                <span className={styles.aiDisclaimer}>
                  Suggestions only. You still choose what to post.
                </span>
              </div>

              {/* AI Draft Coach Panel */}
              {showCoach && coachFeedback && (
                <div className={styles.coachPanel}>
                  <div className={styles.coachHeader}>
                    <div className={styles.coachTitleGroup}>
                      <Sparkles size={16} className={styles.coachIcon} />
                      <h3 className={styles.coachTitle}>AI Draft Coach</h3>
                    </div>
                    <button
                      type="button"
                      className={styles.coachCloseBtn}
                      onClick={() => setShowCoach(false)}
                      aria-label="Close AI Draft Coach"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {coachFeedback.summary && (
                    <p className={styles.coachFeedbackText}>
                      {coachFeedback.summary}
                    </p>
                  )}

                  {coachFeedback.tips.length > 0 && (
                    <ul className={styles.coachTipsList}>
                      {coachFeedback.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <hr className={styles.formDivider} />

              {/* Footer Actions */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => navigate("/dashboard")}
                  disabled={isBusy}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isBusy}
                >
                  {isSubmitting ? (
                    <span>Posting...</span>
                  ) : (
                    <>
                      <span>Post Question</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
};

export default PostQuestion;
