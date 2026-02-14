import React, {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import {Button, Input, Logo} from "./index"
import {useDispatch} from "react-redux"
import authService from "../api/auth"
import {useForm} from "react-hook-form"

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()
    const [error, setError] = useState("")

    const login = async(data) => {
        setError("")
        try {
            const session = await authService.login(data)
            if (session) {
                const userData = await authService.getCurrentUser()
                if (userData) {
                  dispatch(authLogin({ userData }));
                  if (!userData.isEmailVerified) {
                    navigate("/profile")
                  } else {
                    navigate("/")
                  }
                }
            }
        } catch (error) {
            setError(error.message)
        }
    }

  return (
    <div className='flex min-h-[70vh] w-full items-center justify-center'>
      <div className='grid w-full max-w-4xl gap-8 rounded-[32px] border border-slate-900/10 bg-white/80 p-6 shadow-lg backdrop-blur sm:p-10 lg:grid-cols-[1.1fr,0.9fr]'>
        <div className='flex flex-col justify-between gap-6 rounded-3xl bg-slate-900 px-6 py-10 text-white sm:px-10'>
          <div className='inline-flex items-center gap-3'>
            <Logo width="56px" />
            <span className='text-lg font-semibold'>MegaBlog</span>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80'>Welcome back</p>
            <h2 className='mt-4 text-3xl font-semibold leading-tight'>Sign in to continue your reading journey.</h2>
            <p className='mt-4 text-sm text-slate-200/80'>
              Save posts, build your library, and keep up with the writers you love.
            </p>
          </div>
          <div className='text-xs text-slate-300'>Secure login with JWT.</div>
        </div>
        <div className='flex flex-col justify-center'>
          <div className='mb-6 flex justify-center'>
            <span className='inline-block w-full max-w-[120px]'>
              <Logo width="100%" />
            </span>
          </div>
          <h2 className='text-center text-2xl font-semibold text-slate-900'>Sign in to your account</h2>
          <p className='mt-2 text-center text-sm text-slate-600'>
            Don&apos;t have an account?&nbsp;
            <Link
              to="/signup"
              className='font-semibold text-slate-900 transition hover:text-slate-700'
            >
              Sign up
            </Link>
          </p>
          {error && <p className='mt-6 text-center text-sm text-red-600'>{error}</p>}
          <form onSubmit={handleSubmit(login)} className='mt-8'>
            <div className='space-y-5'>
              <Input
                label="Email"
                placeholder="you@example.com"
                type="email"
                {...register("email", {
                  required: true,
                  validate: {
                    matchPatern: (value) =>
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                      "Email address must be a valid address",
                  }
                })}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: true,
                })}
              />
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
