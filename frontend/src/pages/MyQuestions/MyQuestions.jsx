import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { questionService } from "../../services/questions/question.service.js";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyQuestions() {
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadMine() {
      setLoading(true);
      setError("");
      try {
        const data = await questionService.getQuestions({ mine: true });
        if (active) setQuestions(data);
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message || "Failed to load your questions.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadMine();
    return () => {
      active = false;
    };
  }, []);

  const filtered = questions.filter((q) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      q.title?.toLowerCase().includes(term) ||
      q.content?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter your posted questions..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent"
          />
        </div>
        <Link
          to="/questions/ask"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#FF6B1A] hover:bg-[#e55c10] text-white text-sm font-semibold transition"
        >
          Ask a Question
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-sm text-gray-500">
          Loading your questions...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <p className="text-base font-semibold text-gray-800">
            {questions.length === 0
              ? "You haven't asked any questions yet"
              : "No matching questions found"}
          </p>
          <p className="text-xs text-gray-500">
            Post your first coding question to get feedback from Evangadi
            learners and mentors.
          </p>
          <div className="pt-2">
            <Link
              to="/questions/ask"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-[#FF6B1A] text-white text-xs font-semibold hover:bg-[#e55c10] transition"
            >
              Ask Your First Question
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <Link
              key={q.question_hash}
              to={`/question/${q.question_hash}`}
              className="block bg-white rounded-2xl border border-gray-200 hover:border-[#FF6B1A]/60 p-5 shadow-sm transition group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#FF6B1A] transition">
                    {q.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {q.content}
                  </p>
                  <p className="text-xs text-gray-400 pt-1">
                    Posted {formatDate(q.created_at)}
                  </p>
                </div>

                <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 text-[#FF6B1A]">
                  {q.answer_count ?? 0}{" "}
                  {Number(q.answer_count) === 1 ? "Reply" : "Replies"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
