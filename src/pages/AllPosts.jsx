import React, {useState, useEffect} from 'react'
import { Container, PostCard } from '../components'
import postsService from "../api/posts";

function AllPosts() {
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [error, setError] = useState("")
    const [query, setQuery] = useState("")
    const [category, setCategory] = useState("")
    const [tag, setTag] = useState("")
    useEffect(() => {
        setError("")
        postsService
            .getPosts({ page, limit: 12, q: query, category, tag })
            .then((posts) => {
                if (posts) {
                    setPosts(posts.documents)
                    setTotalPages(posts.meta?.totalPages || 1)
                }
            })
            .catch((err) => setError(err.message || "Failed to load posts"))
    }, [page, query, category, tag])
  return (
    <div className='w-full py-8'>
        <Container>
            {error && (
                <div className='motion-fade-in mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                    {error}
                </div>
            )}
            <div className='motion-fade-up mb-6 grid gap-3 md:grid-cols-[1.6fr,1fr,1fr]'>
                <input
                    className='w-full rounded-2xl border border-slate-900/10 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900/30 focus:bg-white focus:ring-2 focus:ring-amber-200'
                    placeholder='Search posts...'
                    value={query}
                    onChange={(e) => {
                        setPage(1);
                        setQuery(e.target.value);
                    }}
                />
                <input
                    className='w-full rounded-2xl border border-slate-900/10 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900/30 focus:bg-white focus:ring-2 focus:ring-amber-200'
                    placeholder='Filter by category'
                    value={category}
                    onChange={(e) => {
                        setPage(1);
                        setCategory(e.target.value);
                    }}
                />
                <input
                    className='w-full rounded-2xl border border-slate-900/10 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900/30 focus:bg-white focus:ring-2 focus:ring-amber-200'
                    placeholder='Filter by tag'
                    value={tag}
                    onChange={(e) => {
                        setPage(1);
                        setTag(e.target.value);
                    }}
                />
            </div>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {posts.map((post, index) => (
                    <div key={post.$id} style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}>
                        <PostCard {...post} />
                    </div>
                ))}
            </div>
            {totalPages > 1 && (
                <div className='mt-8 flex items-center justify-center gap-3'>
                    <button
                        type='button'
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        className='rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900/20 hover:text-slate-900 hover:shadow'
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span className='text-sm text-slate-600'>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        type='button'
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        className='rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900/20 hover:text-slate-900 hover:shadow'
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
            </Container>
    </div>
  )
}

export default AllPosts
