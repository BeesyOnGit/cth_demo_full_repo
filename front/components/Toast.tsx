import React, { useEffect } from "react";
import { useToastStore } from "../store/useToastStore";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

export const Toast: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    const getToastStyles = (type: string) => {
        const styles = {
            success: {
                bg: "bg-green-50 border-green-200",
                text: "text-green-800",
                icon: <CheckCircle className="w-5 h-5 text-green-500" />,
            },
            error: {
                bg: "bg-red-50 border-red-200",
                text: "text-red-800",
                icon: <XCircle className="w-5 h-5 text-red-500" />,
            },
            warning: {
                bg: "bg-amber-50 border-amber-200",
                text: "text-amber-800",
                icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
            },
            info: {
                bg: "bg-blue-50 border-blue-200",
                text: "text-blue-800",
                icon: <Info className="w-5 h-5 text-blue-500" />,
            },
        };
        return styles[type as keyof typeof styles] || styles.info;
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md">
            {toasts.map((toast) => {
                const style = getToastStyles(toast.type);
                if (typeof toast.message !== "string") {
                    return null;
                }
                return (
                    <div key={toast.id} className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in-right ${style.bg}`}>
                        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
                        <p className={`flex-1 text-sm font-medium ${style.text}`}>{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className={`flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors ${style.text}`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
