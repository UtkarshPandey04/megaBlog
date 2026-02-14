import React from "react";

export default function Button({
    children,
    type = "button",
    bgColor = "bg-slate-900",
    textColor = "text-white",
    className = "",
    ...props
}) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow ${bgColor} ${textColor} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
