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
  const [menuOpen, setMenuOpen] = useState(false)

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
    <header className='sticky top-0 z-40 border-b border-slate-900/10 bg-white/50 backdrop-blur-xl'>
      <Container>
        <nav className='py-3 sm:py-4'>
          <div className='flex items-center justify-between gap-3'>
            <Link to='/' className='inline-flex items-center gap-2.5 rounded-full px-1 py-1 sm:gap-3'>
              <Logo width='58px' />
              <span className='text-base font-semibold tracking-tight text-slate-900 sm:text-lg'>MegaBlog</span>
            </Link>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                className='theme-toggle inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-semibold transition'
                aria-label='Toggle theme'
              >
                <span className='theme-toggle__track'>
                  <span className={`theme-toggle__thumb ${theme === 'dark' ? 'is-dark' : ''}`} />
                </span>
                <span className='theme-toggle__label hidden sm:inline'>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
              <button
                type='button'
                onClick={() => setMenuOpen((prev) => !prev)}
                className='inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-700 shadow-sm sm:hidden'
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                <span className='relative block h-3.5 w-4'>
                  <span className={`absolute left-0 top-0 block h-0.5 w-4 bg-slate-700 transition ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
                  <span className={`absolute left-0 top-[6px] block h-0.5 w-4 bg-slate-700 transition ${menuOpen ? 'opacity-0' : ''}`} />
                  <span className={`absolute left-0 top-3 block h-0.5 w-4 bg-slate-700 transition ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
                </span>
              </button>
            </div>
          </div>
          <ul className={`${menuOpen ? 'surface-glass mt-3 grid rounded-2xl p-3' : 'hidden'} gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      navigate(item.slug)
                    }}
                    className='inline-flex w-full items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-900/20 hover:text-slate-900 hover:shadow sm:w-auto'
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}
            {authStatus && userData && (
              <li className='flex w-full items-center gap-2 rounded-full border border-slate-900/10 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm sm:w-auto'>
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
                <div className='min-w-0 flex flex-col leading-tight'>
                  <span className='truncate text-sm font-semibold text-slate-900'>{userData.name}</span>
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
          </ul>
        </nav>
      </Container>
    </header>
  )
}

export default Header

