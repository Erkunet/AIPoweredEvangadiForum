import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { questionService } from "../../services/questions/question.service.js";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(firstName = "", lastName = "") {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";
}

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [similarQuestions, setSimilarQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [checkingFit, setCheckingFit] = useState(false);
  const [fitResult, setFitResult] = useState(null);
  const [fitError, setFitError] = useState("");

  async function loadThread() {
    setLoading(true);
    setError("");
    try {
      const [qData, similarData] = await Promise.all([
        questionService.getQuestionByHash(id),
        questionService.getSimilarQuestions(id).catch(() => []),
      ]);
      setQuestion(qData);
      setSimilarQuestions(similarData);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load question.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadThread();
  }, [id]);

  async function handlePostAnswer(e) {
    e.preventDefault();
    if (!answerText.trim() || answerText.trim().length < 5) {
      setSubmitError("Please write an answer of at least 5 characters.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await questionService.postAnswer({
        questionHash: id,
        content: answerText.trim(),
      });
      setAnswerText("");
      setFitResult(null);
      await loadThread();
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "Could not post your answer.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckFit() {
    if (!answerText.trim() || answerText.trim().length < 10) {
      setFitError("Write at least 10 characters to check answer fit.");
      return;
    }

    setCheckingFit(true);
    setFitError("");
    try {
      const result = await questionService.checkAnswerFit({
        questionHash: id,
        draftAnswer: answerText.trim(),
      });
      setFitResult(result);
    } catch (err) {
      setFitError(
        err?.response?.data?.message ||
          "AI Answer Fit requires a configured GEMINI_API_KEY.",
      );
    } finally {
      setCheckingFit(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-gray-500">
        Loading thread...
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 mb-4">
          {error || "Question not found."}
        </div>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-[#FF6B1A] hover:underline"
        >
          &larr; Back to All Questions
        </Link>
      </div>
    );
  }

  const answers = question.answers || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#FF6B1A] transition"
        >
          <span>&larr;</span>
          <span>Back to Questions</span>
        </Link>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-[#FF6B1A]">
          {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-4">
          {question.title}
        </h1>

        <div className="flex items-center gap-3 pb-5 mb-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-[#1E293B] text-white text-xs font-semibold flex items-center justify-center">
            {getInitials(question.first_name, question.last_name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {question.first_name} {question.last_name}
            </p>
            <p className="text-xs text-gray-500">
              Asked on {formatDate(question.created_at)}
            </p>
          </div>
        </div>

        <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {question.content}
        </div>
      </div>

      {/* Community Answers */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">
          Answers from the Community ({answers.length})
        </h2>

        {answers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              No answers yet — be the first to help!
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Share clear steps, explanations, or code snippets below.
            </p>
          </div>
        ) : (
          answers.map((ans) => (
            <div
              key={ans.answer_id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF6B1A] text-xs font-bold flex items-center justify-center">
                    {getInitials(ans.first_name, ans.last_name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {ans.first_name} {ans.last_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(ans.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {ans.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Post an Answer Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Your Answer</h3>
        <p className="text-xs text-gray-500 mb-4">
          Explain your solution clearly so fellow Evangadi learners can follow
          along.
        </p>

        <form onSubmit={handlePostAnswer} className="space-y-4">
          <textarea
            rows={5}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Write your answer here..."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent"
          />

          {submitError && (
            <p className="text-xs font-medium text-red-600">{submitError}</p>
          )}
          {fitError && (
            <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {fitError}
            </p>
          )}

          {fitResult && (
            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-[#FF6B1A]">
                  AI Answer Fit Review
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-gray-800 border border-orange-200">
                  Score: {fitResult.fitScore}/100 ({fitResult.verdict})
                </span>
              </div>
              <p className="text-sm text-gray-700">{fitResult.feedback}</p>
              {Array.isArray(fitResult.suggestions) &&
                fitResult.suggestions.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    {fitResult.suggestions.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#FF6B1A] hover:bg-[#e55c10] text-white text-sm font-semibold transition disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Post Your Answer"}
            </button>

            <button
              type="button"
              onClick={handleCheckFit}
              disabled={checkingFit}
              className="px-4 py-2.5 rounded-xl border border-gray-300 hover:border-[#FF6B1A] text-gray-700 hover:text-[#FF6B1A] text-sm font-medium transition disabled:opacity-60"
            >
              {checkingFit ? "Checking fit..." : "Check Answer Fit"}
            </button>
          </div>
        </form>
      </div>

      {/* Related Questions (if available) */}
      {similarQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Related Questions
          </h3>
          <ul className="divide-y divide-gray-100">
            {similarQuestions.map((sim) => (
              <li key={sim.question_hash} className="py-2.5">
                <Link
                  to={`/question/${sim.question_hash}`}
                  className="text-sm font-medium text-gray-800 hover:text-[#FF6B1A] transition"
                >
                  {sim.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
