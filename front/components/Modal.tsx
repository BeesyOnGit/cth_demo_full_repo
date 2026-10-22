import { X } from "lucide-react";
import React, { useEffect } from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
};

const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

export const Modal = ({ isOpen, onClose, title, children, footer, size = "md", className = "" }: ModalProps) => {
    // Handle ESC key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (!isOpen) return;
        document.addEventListener("keydown", handleEscape);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden"; // Prevent background scroll

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose} // Close on backdrop click
        >
            <div
                className={`w-full ${sizeClasses[size]} bg-surface rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto ring-1 ring-border ${className}`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-surface z-10">
                    <h3 className="text-lg font-bold text-primary">{title}</h3>
                    <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                        <X size={20} className="text-slate-400 hover:text-danger" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">{children}</div>

                {/* Footer */}
                {footer && <div className="px-6 py-4 bg-background flex justify-end gap-3 sticky bottom-0 z-10 border-t border-border">{footer}</div>}
            </div>
        </div>
    );
};
