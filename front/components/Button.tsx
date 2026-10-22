import React, { useState } from "react";
import { Loader } from "./Loader";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger" | "outline";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
};

export const Button = ({ variant = "primary", size = "md", className = "", loading, ...props }: ButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const base =
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
        primary: "bg-accent text-white hover:bg-sky-600 focus:ring-sky-500",
        secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-700",
        danger: "bg-danger text-white hover:bg-red-600 focus:ring-red-500",
        outline:
            "border border-slate-300 bg-transparent text-slate-700 hover:text-white hover:border-white hover:bg-accent focus:ring-slate-300",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {loading ? <Loader className={variant === "outline" ? "loaderOutline" : ""} /> : props.children}
        </button>
    );
};
