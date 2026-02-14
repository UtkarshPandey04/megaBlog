import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import authService from "../api/auth";
import postsService from "../api/posts";
import { Container, PostCard } from "../components";

export default function Author() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    authService
      .getAuthor(id)
      .then(setAuthor)
      .catch((err) => setError(err.message || "Failed to load author"));
    postsService
      .getPosts({ author: id, status: "active", limit: 12 })
      .then((res) => setPosts(res.documents || []))
      .catch(() => {});
  }, [id]);

  return (
    <div className="py-8">
      <Container>
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {author && (
          <div className="mb-8 rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Author</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{author.name}</h1>
            <p className="mt-2 text-sm text-slate-600">{author.email}</p>
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <PostCard key={post.$id} {...post} />
          ))}
        </div>
      </Container>
    </div>
  );
}
