import React from 'react'
import {useDispatch} from 'react-redux'
import authService from '../../api/auth'
import {logout} from '../../store/authSlice'

function LogoutBtn() {
    const dispatch = useDispatch()
    const logoutHandler = () => {
        authService.logout().then(() => {
            dispatch(logout())
        })
    }
  return (
    <button
    className='inline-flex items-center rounded-full border border-slate-900/10 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800'
    onClick={logoutHandler}
    >Logout</button>
  )
}

export default LogoutBtn
