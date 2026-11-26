import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bold, Italic, Code, Link2, Sparkles, Send } from "lucide-react";
import { questionService } from "../../services/questions/question.service";

export default function AskQuestion() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [coaching, setCoaching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [coachFeedback, setCoachFeedback] = useState(null);

  const insertSnippet = (before, after = "") => {
    const textarea = document.getElementById("question-details");
    if (!textarea) {
      setContent((prev) => `${prev}${before}${after}`);
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const selected = content.slice(start, end);
    const replacement = `${before}${selected || "text"}${after}`;
    const nextValue =
      content.slice(0, start) + replacement + content.slice(end);

    setContent(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + replacement.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleGetAiSuggestions = async () => {
    setErrorMsg("");
    if (!title.trim() && !content.trim()) {
      setErrorMsg(
        "Write a title or problem details first to get AI suggestions.",
      );
      return;
    }

    setCoaching(true);
    try {
      const feedback = await questionService.coachDraft({ title, content });
      setCoachFeedback(feedback);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load AI suggestions. Please try again.",
      );
    } finally {
      setCoaching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (title.trim().length < 5 || title.trim().length > 255) {
      setErrorMsg("Title must be between 5 and 255 characters.");
      return;
    }
    if (content.trim().length < 10) {
      setErrorMsg("Details must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await questionService.createQuestion({
        title: title.trim(),
        content: content.trim(),
      });
      if (created?.question_hash) {
        navigate(`/question/${created.question_hash}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to post question. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Heading */}
      <div>
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#ea580c]">
          Ask the Cohort
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mt-0.5">
          Publish to the forum
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Public threads help the whole cohort. Write as if a classmate will
          debug your issue tomorrow. They only know what you put on the page.
        </p>
      </div>

      {/* Checklist & Validation Rules Card */}
      <section className="rounded-2xl border border-[#f97316] bg-white p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Write questions people can answer in one pass
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Mentors volunteer their time. Give them runnable context, expected
            vs actual behavior, and a tight scope so they can reproduce the
            issue without guessing your setup.
          </p>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-gray-900">
            Checklist before you post
          </h4>
          <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
            <li>
              <strong className="text-gray-800">Title as a headline</strong>{" "}
              that states the symptom and tech stack (e.g., “React state resets
              after navigation”).
            </li>
            <li>
              <strong className="text-gray-800">Repro steps</strong> numbered,
              with environment (OS, browser, Node version) when it matters.
            </li>
            <li>
              <strong className="text-gray-800">Minimal code</strong> in fenced
              markdown blocks; trim unrelated lines so readers scan faster.
            </li>
            <li>
              <strong className="text-gray-800">Exact errors</strong> copied
              verbatim, including stack trace snippets when debugging backend
              routes.
            </li>
          </ul>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-gray-900">
            Validation rules (enforced by the form)
          </h4>
          <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
            <li>
              <strong className="text-gray-800">Title length:</strong> Must be
              between 5 and 255 characters.
            </li>
            <li>
              <strong className="text-gray-800">Body length:</strong> Must
              contain a minimum of 10 characters detailing your problem.
            </li>
            <li>
              <strong className="text-gray-800">Single topic:</strong> Split
              unrelated bugs into separate threads so search and embeddings stay
              precise.
            </li>
          </ul>
        </div>
      </section>

      {/* Question Form Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200/90 bg-white p-6 space-y-5 shadow-2xs"
      >
        {errorMsg && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600"
          >
            {errorMsg}
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label
            htmlFor="question-title"
            className="block text-xs font-bold text-gray-900"
          >
            Title
          </label>
          <p className="text-xs text-gray-500">
            Be specific and imagine you&apos;re asking a question to another
            person.
          </p>
          <input
            id="question-title"
            type="text"
            maxLength={255}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How do I handle state management using Context API in React?"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {/* Details & Markdown Toolbar */}
        <div className="space-y-1.5">
          <label
            htmlFor="question-details"
            className="block text-xs font-bold text-gray-900"
          >
            What are the details of your problem?
          </label>
          <p className="text-xs text-gray-500">
            Introduce the problem and expand on what you put in the title.
            Minimum 10 characters.
          </p>

          <div className="overflow-hidden rounded-xl border border-gray-200 focus-within:border-[#f97316] focus-within:ring-2 focus-within:ring-orange-500/20">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-3 py-2">
              <div className="flex items-center gap-2 text-gray-600">
                <button
                  type="button"
                  onClick={() => insertSnippet("**", "**")}
                  title="Bold"
                  className="rounded p-1 hover:bg-gray-200/70 cursor-pointer"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("*", "*")}
                  title="Italic"
                  className="rounded p-1 hover:bg-gray-200/70 cursor-pointer"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <span className="h-3.5 w-px bg-gray-300" />
                <button
                  type="button"
                  onClick={() => insertSnippet("\n```js\n", "\n```\n")}
                  title="Code block"
                  className="rounded p-1 hover:bg-gray-200/70 cursor-pointer"
                >
                  <Code className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("[", "](https://)")}
                  title="Link"
                  className="rounded p-1 hover:bg-gray-200/70 cursor-pointer"
                >
                  <Link2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="text-[11px] text-gray-400">
                {content.length} characters
              </span>
            </div>

            <textarea
              id="question-details"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Include all the information someone would need to answer your question... You can use Markdown to format your code!"
              className="block w-full resize-y border-0 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* AI Suggestions Trigger Row */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGetAiSuggestions}
            disabled={coaching || submitting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 px-3 py-1.5 text-xs font-medium text-gray-800 shadow-2xs transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-gray-700" />
            <span>{coaching ? "Thinking..." : "AI suggestions"}</span>
          </button>
          <span className="text-xs text-gray-400">
            Suggestions only. You still choose what to post.
          </span>
        </div>

        {/* AI Coach Feedback Box (when requested) */}
        {coachFeedback && (
          <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 space-y-2.5 text-xs text-gray-700">
            <div className="font-semibold text-orange-900">AI Draft Coach</div>
            {coachFeedback.summary && <p>{coachFeedback.summary}</p>}
            {coachFeedback.suggestedTitle && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white border border-orange-200/70 px-3 py-2">
                <span className="font-medium text-gray-900">
                  Suggested title: {coachFeedback.suggestedTitle}
                </span>
                <button
                  type="button"
                  onClick={() => setTitle(coachFeedback.suggestedTitle)}
                  className="rounded bg-orange-100 hover:bg-orange-200 px-2.5 py-1 text-[11px] font-semibold text-orange-900 cursor-pointer"
                >
                  Apply title
                </button>
              </div>
            )}
            {Array.isArray(coachFeedback.tips) &&
              coachFeedback.tips.length > 0 && (
                <ul className="list-disc pl-4 space-y-1">
                  {coachFeedback.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              )}
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="rounded-lg px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || coaching}
            className="inline-flex items-center gap-2 rounded-lg bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-60 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition cursor-pointer"
          >
            <span>{submitting ? "Posting..." : "Post Question"}</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
