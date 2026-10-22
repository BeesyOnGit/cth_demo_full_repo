import React from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { useLanguage } from "@/i18n";

export type FilterFormatter = {
    key: string;
    format: (value: string) => string;
};

type FiltersDisplayProps = {
    excludeKeys?: string[];
    formatters?: FilterFormatter[];
};

export const FiltersDisplay: React.FC<FiltersDisplayProps> = ({ excludeKeys = [], formatters = [] }) => {
    const { t } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get all active filters from URL params
    const activeFilters = Array.from(searchParams.entries()).filter(([key]) => !excludeKeys.includes(key) && searchParams.get(key) !== "");

    // Remove a specific filter
    const removeFilter = (key: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete(key);
        setSearchParams(newParams);
    };

    // Clear all filters
    const clearAllFilters = () => {
        const newParams = new URLSearchParams();
        // Keep excluded keys if they exist
        excludeKeys.forEach((key) => {
            const value = searchParams.get(key);
            if (value) {
                newParams.set(key, value);
            }
        });
        setSearchParams(newParams);
    };

    // Format filter value based on provided formatters
    const formatValue = (key: string, value: string): string => {
        const formatter = formatters.find((f) => f.key === key);
        if (formatter) {
            return formatter.format(value);
        }
        return value;
    };

    // Format filter key for display
    const formatKey = (key: string): string => {
        // Try to get translation, fallback to formatted key
        const translationKey = key as any;
        const translated = t(translationKey);
        if (translated !== key) {
            return translated;
        }
        // Format key: convert camelCase to Title Case
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-sm font-medium text-slate-700">{t("activeFilters") || "Active Filters"}:</span>
            {activeFilters.map(([key, value]) => (
                <div
                    key={key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-md border border-slate-300 text-sm group hover:border-slate-400 transition-colors"
                >
                    <span className="text-slate-600 font-medium">{formatKey(key)}:</span>
                    <span className="text-slate-900">{formatValue(key, value)}</span>
                    <button
                        onClick={() => removeFilter(key)}
                        className="ms-1 p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={`Remove ${key} filter`}
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
            {activeFilters.length > 1 && (
                <button
                    onClick={clearAllFilters}
                    className="ms-2 px-3 py-1.5 text-sm font-medium text-danger hover:text-danger-dark hover:bg-danger/10 rounded-md transition-colors"
                >
                    {t("clearAll") || "Clear All"}
                </button>
            )}
        </div>
    );
};
