import React, {useId} from 'react'

const Input = React.forwardRef( function Input({
    label,
    type = "text",
    className = "",
    ...props
}, ref){
    const id = useId()
    return (
        <div className='w-full'>
            {label && (
                <label
                    className='mb-2 inline-block text-sm font-medium text-slate-700'
                    htmlFor={id}
                >
                    {label}
                </label>
            )}
            <input
            type={type}
            className={`w-full rounded-2xl border border-slate-900/10 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900/30 focus:bg-white focus:ring-2 focus:ring-amber-200 ${className}`}
            ref={ref}
            {...props}
            id={id}
            />
        </div>
    )
})

export default Input
