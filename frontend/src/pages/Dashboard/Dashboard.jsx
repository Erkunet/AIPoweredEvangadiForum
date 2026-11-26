import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Clock,
  BookOpen,
  FolderOpen,
  SquarePen,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { questionService } from "../../services/questions/question.service";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const initialMode =
    searchParams.get("mode") === "semantic" ? "semantic" : "keyword";

  const [query, setQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState(initialMode);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName = user?.firstName?.trim() || user?.first_name?.trim();
  const welcomeLine = firstName
    ? `Good to see you, ${firstName}.`
    : "Welcome to the forum.";

  useEffect(() => {
    let isMounted = true;
    const activeQ = searchParams.get("q") || "";
    const activeMode =
      searchParams.get("mode") === "semantic" ? "semantic" : "keyword";

    setQuery(activeQ);
    setSearchMode(activeMode);

    async function loadQuestions() {
      setLoading(true);
      setError("");
      try {
        let results = [];
        if (activeQ.trim() && activeMode === "semantic") {
          results = await questionService.semanticSearch(activeQ);
        } else {
          results = await questionService.getQuestions({ search: activeQ });
        }
        if (isMounted) {
          setQuestions(Array.isArray(results) ? results : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load questions.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadQuestions();
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const stats = useMemo(() => {
    const currentUserId = user?.id ?? user?.user_id;
    const totalQuestions = questions.length;
    const totalReplies = questions.reduce(
      (sum, q) => sum + Number(q.answer_count ?? 0),
      0,
    );
    const unanswered = questions.filter(
      (q) => Number(q.answer_count ?? 0) === 0,
    ).length;
    const yours = currentUserId
      ? questions.filter((q) => Number(q.user_id) === Number(currentUserId))
          .length
      : 0;

    return { totalQuestions, totalReplies, unanswered, yours };
  }, [questions, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const nextParams = {};
    if (query.trim()) {
      nextParams.q = query.trim();
      nextParams.mode = searchMode;
    }
    setSearchParams(nextParams);
  };

  const handleClearSearch = () => {
    setQuery("");
    setSearchParams({});
  };

  const isOwnQuestion = (q) => {
    const currentUserId = user?.id ?? user?.user_id;
    return currentUserId != null && Number(q.user_id) === Number(currentUserId);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Hero Card */}
      <section className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 space-y-6">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#ea580c]">
            Forum Home
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            {welcomeLine}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Start a topic, revisit your own threads, or skim the live feed.
            Search above works from any page once you are back on Home.
          </p>
        </div>

        {/* 3 Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/questions/ask"
            className="group rounded-xl border border-gray-200/90 bg-white hover:border-[#f97316] p-4 flex items-start gap-3.5 transition"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200/80 text-[#ea580c] flex items-center justify-center shrink-0">
              <SquarePen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 group-hover:text-[#ea580c] transition">
                New question
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Share context, errors, and what you already tried
              </p>
            </div>
          </Link>

          <Link
            to="/my-questions"
            className="group rounded-xl border border-gray-200/90 bg-white hover:border-[#f97316] p-4 flex items-start gap-3.5 transition"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200/80 text-[#ea580c] flex items-center justify-center shrink-0">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 group-hover:text-[#ea580c] transition">
                Your topics
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Filtered list of threads you authored
              </p>
            </div>
          </Link>

          <Link
            to="/rag-documents"
            className="group rounded-xl border border-gray-200/90 bg-white hover:border-[#f97316] p-4 flex items-start gap-3.5 transition"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200/80 text-[#ea580c] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 group-hover:text-[#ea580c] transition">
                Knowledge base
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Course library, uploads, and retrieval-backed context for
                threads
              </p>
            </div>
          </Link>
        </div>

        <hr className="border-gray-100" />

        {/* Summary Metric Cards */}
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {loading
              ? "Loading snapshot for the list below..."
              : "Figures below describe the newest threads in this feed (up to 100 from the API)."}
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-xl border border-gray-200/90 bg-[#fafafa] p-4">
              <div className="text-xs text-gray-500">Questions</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {loading ? "—" : stats.totalQuestions}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200/90 bg-[#fafafa] p-4">
              <div className="text-xs text-gray-500">Replies</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {loading ? "—" : stats.totalReplies}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200/90 bg-[#fafafa] p-4">
              <div className="text-xs text-gray-500">Unanswered</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {loading ? "—" : stats.unanswered}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200/90 bg-[#fafafa] p-4">
              <div className="text-xs text-gray-500">Yours</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {loading ? "—" : stats.yours}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar (Keyword + AI Semantic Search) */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-2xl border border-gray-200/90 p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchMode === "semantic"
                ? "Search by meaning with AI similarity..."
                : "Search questions by keyword..."
            }
            className="w-full rounded-lg border border-gray-200 bg-gray-50/60 pl-9 pr-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#f97316] focus:outline-none"
          />
        </div>

        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setSearchMode("keyword")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              searchMode === "keyword"
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Keyword
          </button>
          <button
            type="button"
            onClick={() => setSearchMode("semantic")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              searchMode === "semantic"
                ? "bg-[#f97316] text-white shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>AI Search</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            className="rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 transition cursor-pointer"
          >
            Search
          </button>
          {searchParams.get("q") && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium px-3 py-2 transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Discussion Feed Card */}
      <section className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Discussion feed</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Your threads use a slim left accent in this list.
            </p>
          </div>
          <span className="rounded-md bg-[#f97316] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shrink-0">
            Newest Threads
          </span>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Loading recent questions...
            </div>
          ) : error ? (
            <div className="mx-auto max-w-md my-6 rounded-xl border border-red-200 bg-red-50/80 px-6 py-8 text-center text-sm font-medium text-red-600">
              {error}
            </div>
          ) : questions.length === 0 ? (
            <div className="mx-auto max-w-md my-6 rounded-xl bg-gray-50 border border-gray-200/70 px-6 py-10 text-center space-y-3">
              <p className="text-sm text-gray-600">
                No questions found. Be the first to ask!
              </p>
              <Link
                to="/questions/ask"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-semibold px-3.5 py-2 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ask a Question</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => {
                const mine = isOwnQuestion(q);
                const initials = `${(q.first_name?.[0] || "U").toUpperCase()}${(
                  q.last_name?.[0] || ""
                ).toUpperCase()}`;

                return (
                  <Link
                    key={q.question_hash}
                    to={`/question/${q.question_hash}`}
                    className={`block rounded-xl border p-4 sm:p-5 transition hover:border-orange-300 bg-[#f8fafc]/70 ${
                      mine
                        ? "border-l-4 border-l-[#f97316] border-gray-200/90"
                        : "border-gray-200/80"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {initials}
                      </span>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
                            {q.title}
                          </h3>

                          <div className="flex items-center gap-2 shrink-0">
                            {typeof q.similarity === "number" && (
                              <span className="rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 text-[11px] font-medium">
                                {Math.round(q.similarity * 100)}% match
                              </span>
                            )}
                            {mine && (
                              <span className="rounded bg-amber-100/90 text-amber-800 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                                Yours
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {q.content}
                        </p>

                        <div className="pt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                            <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {q.answer_count ?? 0}{" "}
                            {Number(q.answer_count) === 1
                              ? "answer"
                              : "answers"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {q.created_at
                              ? new Date(q.created_at).toLocaleDateString()
                              : ""}
                          </span>
                          <span>
                            by{" "}
                            {mine
                              ? "You"
                              : `${q.first_name || ""} ${q.last_name || ""}`.trim()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
