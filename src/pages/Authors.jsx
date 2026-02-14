import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import authService from "../api/auth";
import { Container } from "../components";

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    authService
      .getAuthors({ q: query, page, limit: 12 })
      .then((res) => {
        setAuthors(res.documents || []);
        setTotalPages(res.meta?.totalPages || 1);
      })
      .catch((err) => setError(err.message || "Failed to load authors."));
  }, [query, page]);

  return (
    <div className="py-8">
      <Container>
        <section className="mb-6 rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Find Authors</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Discover Writers</h1>
          <p className="mt-2 text-sm text-slate-600">
            Search by name, email, or short bio and open any author profile.
          </p>
          <input
            className="mt-5 w-full rounded-2xl border border-slate-900/10 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900/30 focus:bg-white focus:ring-2 focus:ring-amber-200"
            placeholder="Search authors by name or bio..."
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
          />
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {authors.length === 0 && !error ? (
          <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 text-center shadow-sm">
            <p className="text-sm text-slate-600">No authors found.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {authors.map((author) => (
              <Link
                key={author.$id}
                to={`/author/${author.$id}`}
                className="group rounded-3xl border border-slate-900/10 bg-white/85 p-5 shadow-sm transition hover:-translate-y-1 hover:border-slate-900/20 hover:shadow-lg"
              >
                <div className="mb-4 h-14 w-14 overflow-hidden rounded-full bg-slate-200">
                  {author.avatarUrl ? (
                    <img src={author.avatarUrl} alt={author.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{author.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{author.email}</p>
                <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                  {author.description || "No bio added yet."}
                </p>
                <p className="mt-4 text-sm font-semibold text-slate-900">
                  View profile <span className="transition group-hover:translate-x-1 inline-block">{">"}</span>
                </p>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900/20 hover:text-slate-900 hover:shadow sm:min-w-[110px]"
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-center text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900/20 hover:text-slate-900 hover:shadow sm:min-w-[110px]"
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </Container>
    </div>
  );
}
