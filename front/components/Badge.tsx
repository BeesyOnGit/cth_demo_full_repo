import React from "react";

export const Badge: React.FC<{ children: React.ReactNode; variant?: "success" | "warning" | "danger" | "neutral" }> = ({
    children,
    variant = "neutral",
}) => {
    const variants = {
        success: "bg-emerald-100 text-emerald-800 border-emerald-200",
        warning: "bg-amber-100 text-amber-800 border-amber-200",
        danger: "bg-rose-100 text-rose-800 border-rose-200",
        neutral: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>{children}</span>;
};
