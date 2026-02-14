import React, {useId} from 'react'

function Select({
    options,
    label,
    className,
    ...props
}, ref) {
    const id = useId()
  return (
    <div className='w-full'>
        {label && (
            <label htmlFor={id} className='mb-2 inline-block text-sm font-medium text-slate-700'>
                {label}
            </label>
        )}
        <select
        {...props}
        id={id}
        ref={ref}
        className={`w-full rounded-2xl border border-slate-900/10 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900/30 focus:bg-white focus:ring-2 focus:ring-amber-200 ${className}`}
        >
            {options?.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
  )
}

export default React.forwardRef(Select)
