import React, {useEffect, useState} from 'react'
import postsService from "../api/posts";
import {Container, PostCard} from '../components'

function Home() {
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
            .getPosts({ status: "active", page, limit: 8, q: query, category, tag })
            .then((posts) => {
                if (posts) {
                    setPosts(posts.documents)
                    setTotalPages(posts.meta?.totalPages || 1)
                }
            })
            .catch((err) => setError(err.message || "Failed to load posts"))
    }, [page, query, category, tag])
  
    if (!error && posts.length === 0 && !query && !category && !tag) {
        return (
            <div className="w-full py-12">
                <Container>
                    <div className="motion-fade-up rounded-3xl border border-slate-900/10 bg-white/80 p-8 text-center shadow-sm backdrop-blur sm:p-12">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                            Welcome to MegaBlog
                        </p>
                        <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
                            Login to read thoughtful stories and insights.
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
                            Save your favorites, follow writers, and build a feed that feels curated just for you.
                        </p>
                    </div>
                </Container>
            </div>
        )
    }
    return (
        <div className='w-full py-8'>
            <Container>
                {error && (
                    <div className='motion-fade-in mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                        {error}
                    </div>
                )}
                <div className='motion-fade-up mb-8 flex flex-col gap-3'>
                    <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-500'>Latest Posts</p>
                    <h2 className='text-3xl font-semibold text-slate-900 sm:text-4xl'>Fresh reads from the community.</h2>
                    <p className='max-w-2xl text-base text-slate-600'>
                        Discover ideas across product, design, and engineering. Updated weekly.
                    </p>
                </div>
                <div className='motion-fade-up motion-delay-1 mb-6 grid gap-3 md:grid-cols-[1.6fr,1fr,1fr]'>
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
                        <div key={post.$id} style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}>
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

export default Home
