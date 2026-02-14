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
            <div className="w-full py-10 sm:py-14">
                <Container>
                    <div className="motion-fade-up surface-glass relative overflow-hidden rounded-3xl p-7 text-center sm:p-12">
                        <div className="mesh-accent" />
                        <p className="section-kicker relative z-10">
                            Welcome to MegaBlog
                        </p>
                        <h1 className="relative z-10 mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
                            Login to read thoughtful stories and insights.
                        </h1>
                        <p className="relative z-10 mx-auto mt-4 max-w-2xl text-base text-slate-600">
                            Save your favorites, follow writers, and build a feed that feels curated just for you.
                        </p>
                    </div>
                </Container>
            </div>
        )
    }
    return (
        <div className='w-full py-6 sm:py-8'>
            <Container>
                {error && (
                    <div className='motion-fade-in mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                        {error}
                    </div>
                )}
                <section className='motion-fade-up surface-glass relative mb-7 overflow-hidden rounded-3xl px-5 py-7 sm:px-8 sm:py-10'>
                    <div className='mesh-accent' />
                    <div className='relative z-10 grid gap-8 lg:grid-cols-[1.4fr,0.9fr] lg:items-end'>
                        <div>
                            <p className='section-kicker'>Editorial Feed</p>
                            <h2 className='mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-5xl'>
                                Fresh reads from the community.
                            </h2>
                            <p className='mt-4 max-w-2xl text-sm text-slate-600 sm:text-base'>
                                Discover ideas across engineering, design, product, and creator workflows with clean reading cards and fast filtering.
                            </p>
                        </div>
                        <div className='grid grid-cols-2 gap-3 sm:gap-4'>
                            <div className='rounded-2xl border border-slate-900/10 bg-white/70 p-4 shadow-sm'>
                                <p className='text-2xl font-semibold text-slate-900'>{posts.length}</p>
                                <p className='mt-1 text-xs text-slate-500'>posts on screen</p>
                            </div>
                            <div className='rounded-2xl border border-slate-900/10 bg-white/70 p-4 shadow-sm'>
                                <p className='text-2xl font-semibold text-slate-900'>{totalPages}</p>
                                <p className='mt-1 text-xs text-slate-500'>pages available</p>
                            </div>
                        </div>
                    </div>
                </section>
                <div className='motion-fade-up motion-delay-1 surface-glass mb-6 rounded-3xl p-3 sm:p-4'>
                    <div className='mb-3 flex flex-wrap gap-2'>
                        <span className='pill-tag'>Search</span>
                        <span className='pill-tag'>Category</span>
                        <span className='pill-tag'>Tag</span>
                    </div>
                    <div className='grid gap-3 md:grid-cols-[1.6fr,1fr,1fr]'>
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
                </div>
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {posts.map((post, index) => (
                        <div key={post.$id} style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}>
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
                {totalPages > 1 && (
                    <div className='mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center'>
                        <button
                            type='button'
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            className='rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900/20 hover:text-slate-900 hover:shadow sm:min-w-[110px]'
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span className='text-center text-sm text-slate-600'>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            type='button'
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            className='rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900/20 hover:text-slate-900 hover:shadow sm:min-w-[110px]'
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
