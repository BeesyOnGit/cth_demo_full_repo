import React, { useState } from "react";
import { Loader } from "./Loader";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger" | "outline";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    icon: React.ReactNode;
};

export const MiniButton = ({ variant = "primary", size = "md", className = "", loading, icon, ...props }: ButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const base =
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none overflow-hidden cursor-pointer";

    const variants = {
        primary: "bg-accent text-white hover:bg-sky-600 focus:ring-sky-500",
        secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-700",
        danger: "bg-danger text-white hover:bg-red-600 focus:ring-red-500",
        outline: "border border-slate-300 bg-transparent text-slate-700 hover:text-white hover:border-white hover:bg-accent focus:ring-slate-300",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {loading ? (
                <Loader className={variant === "outline" ? "loaderOutline" : ""} />
            ) : (
                <div className="flex items-center gap-0 whitespace-nowrap">
                    <span className="flex-shrink-0">{icon}</span>
                    <span
                        className="inline-block overflow-hidden transition-all duration-300 ease-in-out"
                        style={{
                            maxWidth: isHovered ? "200px" : "0px",
                            opacity: isHovered ? 1 : 0,
                            paddingInlineStart: isHovered ? "8px" : "0px",
                        }}
                    >
                        {props.children}
                    </span>
                </div>
            )}
        </button>
    );
};
