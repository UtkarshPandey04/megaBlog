import React, { useEffect, useState } from "react";
import authService from "../api/auth";
import postsService from "../api/posts";
import { Container, PostCard } from "../components";

export default function Bookmarks() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    authService
      .getBookmarks()
      .then(async (res) => {
        const slugs = res.bookmarks || [];
        if (!slugs.length) {
          setPosts([]);
          return;
        }
        const results = await Promise.all(
          slugs.map((slug) => postsService.getPost(slug).catch(() => null))
        );
        setPosts(results.filter(Boolean));
      })
      .catch((err) => setError(err.message || "Failed to load bookmarks"));
  }, []);

  return (
    <div className="py-8">
      <Container>
        <h1 className="mb-6 text-3xl font-semibold text-slate-900">Bookmarks</h1>
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {posts.length === 0 && !error ? (
          <div className="rounded-3xl border border-slate-900/10 bg-white/80 p-8 text-center shadow-sm">
            <p className="text-sm text-slate-600">No bookmarks yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => (
              <PostCard key={post.$id} {...post} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
