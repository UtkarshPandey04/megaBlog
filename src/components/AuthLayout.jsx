import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'

export default function Protected({children, authentication = true}) {

    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        //TODO: make it more easy to understand

        // if (authStatus ===true){
        //     navigate("/")
        // } else if (authStatus === false) {
        //     navigate("/login")
        // }
        
        //let authValue = authStatus === true ? true : false

        if(authentication && authStatus !== authentication){
            navigate("/login")
        } else if(!authentication && authStatus !== authentication){
            navigate("/")
        }
        setLoader(false)
    }, [authStatus, navigate, authentication])

  if (loader) {
    return (
      <div className='grid min-h-[70vh] place-items-center'>
        <div className='flex flex-col items-center gap-4 rounded-3xl border border-slate-900/10 bg-white/80 px-6 py-8 shadow-sm backdrop-blur sm:px-10'>
          <span className='h-10 w-10 animate-spin rounded-full border-4 border-slate-900/10 border-t-slate-900' />
          <p className='text-sm font-medium text-slate-600'>Checking your session...</p>
        </div>
      </div>
    )
  }

  if (!authentication) {
    return (
      <div className='relative overflow-hidden'>
        <div className='pointer-events-none absolute inset-0 -z-10 opacity-60'>
          <div className='absolute -left-20 top-16 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl' />
          <div className='absolute right-10 top-40 h-72 w-72 rounded-full bg-teal-200/60 blur-3xl' />
          <div className='absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-rose-200/50 blur-3xl' />
        </div>
        {children}
      </div>
    )
  }

  return <>{children}</>
}

