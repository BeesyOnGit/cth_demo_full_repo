import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = "", ...props }) => (
    <div className="w-full">
        {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
        <select
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-slate-100 ${
                error ? "border-danger" : "border-slate-300"
            } ${className}`}
            {...props}
        >
            <option value="" disabled>
                Select option
            </option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
);
