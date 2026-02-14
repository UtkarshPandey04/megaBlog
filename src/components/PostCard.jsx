import React from 'react'
import postsService from "../api/posts"
import {Link} from 'react-router-dom'

function PostCard({$id, title, featuredImage, category, tags}) {
  return (
    <Link to={`/post/${$id}`}>
      <article className='group motion-fade-up surface-glass flex h-full flex-col overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1.5 hover:border-slate-900/20 hover:shadow-xl'>
        <div className='relative aspect-[4/3] w-full overflow-hidden bg-slate-100'>
          <img
            src={postsService.getFilePreview(featuredImage)}
            alt={title}
            className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
          />
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-80 transition group-hover:opacity-95' />
        </div>
        <div className='flex flex-1 flex-col gap-3 p-4 sm:p-5'>
          <div className='flex flex-wrap gap-2 text-xs text-slate-600'>
            {category && (
              <span className='rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900'>
                {category}
              </span>
            )}
            {tags?.slice(0, 2).map((tag) => (
              <span key={tag} className='rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700'>
                #{tag}
              </span>
            ))}
          </div>
          <h2 className='text-lg font-semibold leading-snug text-slate-900'>{title}</h2>
          <p className='text-sm leading-relaxed text-slate-600'>
            Curated ideas and perspectives from the MegaBlog community.
          </p>
          <span className='mt-auto inline-flex items-center gap-2 text-sm font-semibold text-slate-900'>
            Read article
            <span className='transition group-hover:translate-x-1' aria-hidden='true'>
              {">"}
            </span>
          </span>
        </div>
      </article>
    </Link>
  )
}

export default PostCard
