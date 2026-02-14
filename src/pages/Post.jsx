import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import postsService from "../api/posts";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../store/authSlice";
import authService from "../api/auth";

export default function Post() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [bookmarking, setBookmarking] = useState(false);
  const [liking, setLiking] = useState(false);
  const { slug } = useParams();
  const navigate = useNavigate();

  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();

  const isAuthor = post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    if (slug) {
      postsService.getPost(slug).then((fetchedPost) => {
        if (fetchedPost) setPost(fetchedPost);
        else navigate("/");
      });
      postsService.getComments(slug).then(setComments).catch(() => {});
    } else navigate("/");
  }, [slug, navigate]);

  const deletePost = () => {
    postsService.deletePost(post.$id).then((status) => {
      if (status) {
        navigate("/");
      }
    });
  };

  const readingTime = useMemo(() => {
    if (!post?.content) return 1;
    const text = post.content.replace(/<[^>]+>/g, " ");
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [post]);

  useEffect(() => {
    const handleScroll = () => {
      const progress = document.getElementById("reading-progress");
      if (!progress) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const percent = total > 0 ? (window.scrollY / total) * 100 : 0;
      progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addComment = async () => {
    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }
    setCommentError("");
    try {
      const newComment = await postsService.addComment(slug, commentText.trim());
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (error) {
      setCommentError(error.message || "Failed to add comment.");
    }
  };

  const removeComment = async (commentId) => {
    try {
      await postsService.deleteComment(slug, commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {}
  };

  const toggleBookmark = async () => {
    if (!userData) return;
    setBookmarking(true);
    try {
      if (userData.bookmarks?.includes(post.$id)) {
        const res = await authService.removeBookmark(post.$id);
        dispatch(updateUser({ userData: { ...userData, bookmarks: res.bookmarks } }));
      } else {
        const res = await authService.addBookmark(post.$id);
        dispatch(updateUser({ userData: { ...userData, bookmarks: res.bookmarks } }));
      }
    } finally {
      setBookmarking(false);
    }
  };

  const toggleLike = async () => {
    if (!userData) return;
    if (!post) return;

    setLiking(true);
    try {
      const response = post.likedByMe
        ? await postsService.unlikePost(post.$id)
        : await postsService.likePost(post.$id);

      setPost((prev) =>
        prev
          ? {
              ...prev,
              likesCount: response.likesCount,
              likedByMe: response.likedByMe,
            }
          : prev
      );
    } finally {
      setLiking(false);
    }
  };

  if (!post) return null;

  return (
    <div className="py-6 sm:py-10">
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-transparent">
        <div
          id="reading-progress"
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-teal-500 transition-all"
        />
      </div>
      <Container>
        <section className="motion-fade-up relative overflow-hidden rounded-3xl border border-slate-900/10 bg-white/70 p-3 shadow-lg backdrop-blur sm:p-5">
          <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-slate-200">
            <img
              src={postsService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
            <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2 text-xs text-white/95 sm:left-6 sm:top-6">
              {post.category && (
                <span className="rounded-full bg-amber-300/95 px-3 py-1 font-semibold text-amber-950">
                  {post.category}
                </span>
              )}
              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/35 bg-white/10 px-3 py-1 font-medium text-white"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
              <h1 className="max-w-4xl text-2xl font-semibold leading-tight text-white drop-shadow sm:text-4xl">
                {post.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-100 sm:text-sm">
                <span>{readingTime} min read</span>
                <span className="h-1 w-1 rounded-full bg-slate-200" />
                <span>{post.views} views</span>
                <span className="h-1 w-1 rounded-full bg-slate-200" />
                <span>{post.likesCount || 0} likes</span>
              </div>
            </div>
          </div>
        </section>

        <section className="motion-fade-up motion-delay-1 mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-900/10 bg-white/70 p-3 shadow-sm backdrop-blur">
          <Link
            to={`/author/${post.userId}`}
            className="inline-flex items-center rounded-full border border-slate-900/15 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:text-slate-900"
          >
            View author
          </Link>
          {userData && (
            <Button
              type="button"
              className="text-xs"
              onClick={toggleLike}
              disabled={liking}
              bgColor={post.likedByMe ? "bg-rose-500" : "bg-white"}
              textColor={post.likedByMe ? "text-white" : "text-slate-800"}
            >
              {post.likedByMe ? "Liked" : "Like"} ({post.likesCount || 0})
            </Button>
          )}
          {userData && (
            <Button
              type="button"
              className="text-xs"
              onClick={toggleBookmark}
              disabled={bookmarking}
              bgColor={userData.bookmarks?.includes(post.$id) ? "bg-amber-400" : "bg-slate-900"}
            >
              {userData.bookmarks?.includes(post.$id) ? "Bookmarked" : "Bookmark"}
            </Button>
          )}
          {isAuthor && (
            <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
              <Link to={`/edit-post/${post.$id}`} className="w-full sm:w-auto">
                <Button bgColor="bg-green-500" className="w-full sm:w-auto">Edit</Button>
              </Link>
              <Button bgColor="bg-red-500" onClick={deletePost} className="w-full sm:w-auto">
                Delete
              </Button>
            </div>
          )}
        </section>

        <section className="motion-fade-up motion-delay-2 mt-6">
          <div className="browser-css">{parse(post.content)}</div>
        </section>

        <section className="motion-fade-up motion-delay-3 mt-10 rounded-3xl border border-slate-900/10 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
          {userData ? (
            <div className="mt-4">
              <textarea
                className="w-full rounded-2xl border border-slate-900/10 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900/30 focus:bg-white focus:ring-2 focus:ring-amber-200"
                rows="3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
              />
              {commentError && <p className="mt-2 text-sm text-red-600">{commentError}</p>}
              <Button className="mt-3" onClick={addComment}>
                Add comment
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">Login to join the discussion.</p>
          )}
          <div className="mt-6 space-y-4">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className="motion-fade-up rounded-2xl border border-slate-900/10 bg-white px-4 py-3"
                style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800">{comment.user.name}</span>
                  {userData?.$id === comment.user.id && (
                    <button onClick={() => removeComment(comment.id)} className="text-xs font-semibold text-red-600">
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
