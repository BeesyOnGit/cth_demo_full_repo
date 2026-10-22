import React from "react";
import { useSearchParams } from "react-router-dom";
import { getTranslation } from "@/i18n";
import { ChevronBack, ChevronForward } from "@/utils/rtl";

interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    className?: string;
    showInfo?: boolean;
    pageParam?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ totalItems, itemsPerPage, className = "", showInfo = true, pageParam = "page" }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const t = getTranslation();
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage) || 1);
    const currentPage = Math.min(Math.max(1, Math.floor(Number(searchParams.get(pageParam))) || 1), totalPages);

    const setPage = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            const params = new URLSearchParams(searchParams.toString());
            params.set(pageParam, String(page));
            setSearchParams(params, { replace: true });
        }
    };

    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPages = () => {
        const pages: (number | string)[] = [];
        const max = 5;

        if (totalPages <= max) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        }

        return pages;
    };

    return (
        <div className={`flex items-center justify-between gap-4 ${className}`}>
            {showInfo && (
                <div className="text-xs text-slate-600">
                    {t("showing")} {startItem} {t("to")} {endItem} {t("of")} {totalItems}
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronBack size={16} />
                    {t("prev")}
                </button>

                <div className="flex items-center gap-1">
                    {getPages().map((p, i) => (
                        <React.Fragment key={i}>
                            {p === "..." ? (
                                <span className="px-3 py-2 text-sm text-slate-500">...</span>
                            ) : (
                                <button
                                    onClick={() => setPage(Number(p))}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        currentPage === p
                                            ? "bg-accent text-white"
                                            : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                    {p}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t("next")}
                    <ChevronForward size={16} />
                </button>
            </div>
        </div>
    );
};
