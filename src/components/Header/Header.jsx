import React, { useEffect, useState } from 'react'
import {Container, Logo, LogoutBtn} from '../index'
import { Link } from 'react-router-dom'
import {useSelector} from 'react-redux'
import { useNavigate } from 'react-router-dom'

function Header() {
  const getInitialTheme = () => {
    const saved = localStorage.getItem('megablog-theme')
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('megablog-theme', theme)
  }, [theme])

  const navItems = [
    {
      name: 'Home',
      slug: "/",
      active: true
    }, 
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
  },
  {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
  },
  {
      name: "All Posts",
      slug: "/all-posts",
      active: authStatus,
  },
  {
      name: "Bookmarks",
      slug: "/bookmarks",
      active: authStatus,
  },
  {
      name: "Add Post",
      slug: "/add-post",
      active: authStatus,
  },
  {
      name: "Profile",
      slug: "/profile",
      active: authStatus,
  },
  ]


  return (
    <header className='sticky top-0 z-40 border-b border-slate-900/10 bg-white/70 backdrop-blur'>
      <Container>
        <nav className='flex flex-col gap-4 py-4 sm:flex-row sm:items-center'>
          <div className='flex items-center justify-between'>
            <Link to='/' className='inline-flex items-center gap-3'>
              <Logo width='70px' />
              <span className='text-lg font-semibold tracking-tight text-slate-900'>MegaBlog</span>
            </Link>
          </div>
          <ul className='flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end'>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className='inline-flex items-center rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900/20 hover:text-slate-900 hover:shadow'
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}
            {authStatus && userData && (
              <li className='flex items-center gap-2 rounded-full border border-slate-900/10 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm'>
                <div className='h-8 w-8 overflow-hidden rounded-full bg-slate-200'>
                  {userData.avatarUrl ? (
                    <img
                      src={userData.avatarUrl}
                      alt={userData.name}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center text-xs font-semibold text-slate-600'>
                      {userData.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className='flex flex-col leading-tight'>
                  <span className='text-sm font-semibold text-slate-900'>{userData.name}</span>
                  <span className='text-[10px] text-slate-500'>
                    {userData.isEmailVerified ? "Email verified" : "Email unverified"}
                  </span>
                </div>
              </li>
            )}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
            <li>
              <button
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                className='theme-toggle inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-semibold transition'
                aria-label='Toggle theme'
              >
                <span className='theme-toggle__track'>
                  <span className={`theme-toggle__thumb ${theme === 'dark' ? 'is-dark' : ''}`} />
                </span>
                <span className='theme-toggle__label'>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  )
}

export default Header

