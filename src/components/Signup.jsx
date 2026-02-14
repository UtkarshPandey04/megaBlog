import React, {useState} from 'react'
import authService from '../api/auth'
import {Link ,useNavigate} from 'react-router-dom'
import {login} from '../store/authSlice'
import {Button, Input, Logo} from './index.js'
import {useDispatch} from 'react-redux'
import {useForm} from 'react-hook-form'

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()

    const create = async(data) => {
        setError("")
        try {
            const avatarFile = data.avatar && data.avatar[0] ? data.avatar[0] : null
            if (!avatarFile) {
              setError("Profile photo is required.")
              return
            }
            if (!ALLOWED_AVATAR_TYPES.includes(avatarFile.type)) {
              setError("Only PNG, JPG, JPEG, GIF, or WEBP images are allowed.")
              return
            }
            if (avatarFile.size > MAX_AVATAR_SIZE_BYTES) {
              setError("Image too large. Maximum size is 2MB.")
              return
            }

            const payload = {
              name: data.name,
              email: data.email,
              password: data.password,
              phone: data.phone,
              dob: data.dob || "",
              description: data.description || "",
              avatar: avatarFile,
            };
            const userData = await authService.createAccount(payload)
            if (userData) {
                const userData = await authService.getCurrentUser()
                if (userData) dispatch(login({ userData }));
                navigate("/verify-email-pending", {
                  state: { email: userData?.email || payload.email },
                })
            }
        } catch (error) {
            setError(error.message)
        }
    }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="grid w-full max-w-4xl gap-8 rounded-[32px] border border-slate-900/10 bg-white/80 p-6 shadow-lg backdrop-blur sm:p-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-amber-50 px-6 py-10 text-slate-900 sm:px-10">
          <div className="inline-flex items-center gap-3">
            <Logo width="56px" />
            <span className="text-lg font-semibold">MegaBlog</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Start here</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">Create your account and join the writers.</h2>
            <p className="mt-4 text-sm text-slate-600">
              Publish your first post in minutes. Build your audience with every story.
            </p>
          </div>
          <div className="text-xs text-slate-500">Join a community of 10k+ creators.</div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex justify-center">
            <span className="inline-block w-full max-w-[120px]">
              <Logo width="100%" />
            </span>
          </div>
          <h2 className="text-center text-2xl font-semibold text-slate-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Already have an account?&nbsp;
            <Link
              to="/login"
              className="font-semibold text-slate-900 transition hover:text-slate-700"
            >
              Sign in
            </Link>
          </p>
          {error && <p className="mt-6 text-center text-sm text-red-600">{error}</p>}

          <form onSubmit={handleSubmit(create)} className="mt-8">
            <div className="space-y-5">
              <Input
                label="Full name"
                placeholder="Enter your full name"
                {...register("name", {
                  required: true,
                })}
              />
              <Input
                label="Profile photo"
                type="file"
                accept="image/png, image/jpg, image/jpeg, image/gif, image/webp"
                {...register("avatar", { required: true })}
              />
              <p className="text-xs text-slate-500">Use PNG/JPG/GIF/WEBP, up to 2MB.</p>
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
                placeholder="Create a password"
                {...register("password", {
                  required: true,
                })}
              />
              <Input
                label="Phone number"
                placeholder="e.g. +1 555 123 4567"
                type="tel"
                {...register("phone", { required: true })}
              />
              <Input
                label="Date of birth (optional)"
                type="date"
                {...register("dob")}
              />
              <Input
                label="Short bio (optional)"
                placeholder="Tell readers about yourself"
                {...register("description")}
              />
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup
