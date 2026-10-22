import React from "react";
import { X } from "lucide-react";

interface TagProps {
    children: React.ReactNode;
    onRemove?: () => void;
    variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const Tag: React.FC<TagProps> = ({ children, onRemove, variant = "primary", size = "sm", className = "" }) => {
    const variantClasses = {
        default: "bg-slate-100 text-slate-700 border border-slate-200",
        primary: "bg-sky-500 text-white",
        success: "bg-emerald-100 text-emerald-800 border-emerald-200",
        warning: "bg-amber-100 text-amber-800 border-amber-200",
        danger: "bg-rose-100 text-rose-800 border-rose-200",
        info: "bg-blue-500 text-white",
    };

    const sizeClasses = {
        sm: "px-2 pb-1 pt-0.5 text-xs",
        md: "px-3 pb-2 pt-1 text-sm",
        lg: "px-4 pb-3 pt-1.5 text-base",
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 16,
    };

    return (
        <span
            className={`inline-flex content-center items-center gap-1.5 rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {children}
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    aria-label="Remove"
                >
                    <X size={iconSizes[size]} />
                </button>
            )}
        </span>
    );
};
