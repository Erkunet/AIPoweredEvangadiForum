import { useState } from "react";
import { Link } from "react-router-dom";

const DOCS = [
  {
    id: "react-hooks",
    category: "Frontend • React",
    title: "Managing State & Effects Safely in React",
    summary:
      "How to avoid infinite useEffect loops, structure async API calls, and keep component state clean.",
    content: [
      "Always include a dependency array on useEffect. Omitting it causes the effect to run after every render.",
      "Keep API calls inside dedicated service modules (e.g., question.service.js) and handle loading and error states cleanly in the component.",
      "Lift shared state only to the nearest common parent or use React Context for cross-app state like authentication.",
    ],
  },
  {
    id: "express-routing",
    category: "Backend • Node & Express",
    title: "Express Route Ordering, Middleware & Error Handling",
    summary:
      "Best practices for mounting routers, JWT authentication middleware, and centralized error responses.",
    content: [
      "Always register literal routes (such as /search or /draft-coach) BEFORE parameterized routes (such as /:questionHash) so Express does not treat the literal segment as a parameter.",
      "Forward async controller errors with next(err) so your centralized Express error middleware returns consistent JSON status codes.",
      "Keep route handlers thin: validate input, call a service function, and return the HTTP response.",
    ],
  },
  {
    id: "mysql-queries",
    category: "Database • MySQL",
    title: "Writing Safe Parameterized Queries & Joins",
    summary:
      "Preventing SQL injection and aggregating counts across users, questions, and answers.",
    content: [
      "Always pass user input via ? placeholders in pool.query(sql, params) instead of string interpolation.",
      "Use LEFT JOIN with COUNT(a.answer_id) and GROUP BY q.question_id to include questions that currently have zero answers.",
      "Store unique public identifiers (like question_hash) to avoid exposing sequential auto-increment IDs in URLs.",
    ],
  },
  {
    id: "jwt-auth",
    category: "Security • Authentication",
    title: "JWT Auth Flow & Protected Routes",
    summary:
      "How login tokens flow from Express auth controllers to Axios interceptors and React ProtectedRoute.",
    content: [
      "Store the signed JWT after login/registration and attach it via an Axios request interceptor (Authorization: Bearer <token>).",
      "Wrap private pages in a ProtectedRoute component that redirects unauthenticated visitors to /login.",
      "Verify tokens on the backend in authenticateUser middleware and attach req.user for downstream controllers.",
    ],
  },
];

export default function KnowledgeBase() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(DOCS.map((d) => d.category))];

  const filteredDocs = DOCS.filter((doc) => {
    const matchesCategory =
      selectedCategory === "All" || doc.category === selectedCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.summary.toLowerCase().includes(q) ||
      doc.content.some((line) => line.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-sm text-gray-500 mt-1">
            Curated Evangadi full-stack engineering guides and troubleshooting
            references.
          </p>
        </div>
        <Link
          to="/questions/ask"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#FF6B1A] hover:bg-[#e55c10] text-white text-sm font-semibold transition"
        >
          Ask a Question
        </Link>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides (e.g., useEffect, Express routes, MySQL JOIN, JWT)..."
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent"
        />

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-[#1E293B] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Cards */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <p className="text-sm font-semibold text-gray-800">
            No matching guides found
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Try another keyword or post your question directly to the community.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-[#FF6B1A]">
                  {doc.category}
                </span>
                <h2 className="text-lg font-bold text-gray-900">{doc.title}</h2>
                <p className="text-sm text-gray-600">{doc.summary}</p>
                <ul className="list-disc list-inside space-y-1.5 pt-2 text-xs text-gray-700 leading-relaxed">
                  {doc.content.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
