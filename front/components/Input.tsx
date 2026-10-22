import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    prefix?: string;
    suffix?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, prefix, suffix, className = "", ...props }) => (
    <div className="w-full">
        {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
        <div className="relative">
            {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">{prefix}</span>}
            <input
                className={`w-full rounded-lg border bg-white py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-slate-100 ${
                    error ? "border-danger focus:border-danger focus:ring-danger" : "border-slate-300"
                } ${prefix ? "pl-8" : "pl-3"} ${suffix ? "pr-12" : "pr-3"} ${className}`}
                {...props}
            />
            {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">{suffix}</span>}
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
);
