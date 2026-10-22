import React from "react";
import { useLanguage } from "@/i18n";

export type TableColumn<T> = {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    align?: "left" | "center" | "right";
    className?: string;
    fixed?: boolean;
    fixedRight?: boolean;
};

type TableProps<T> = {
    columns: TableColumn<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    striped?: boolean;
    hoverable?: boolean;
};

export function Table<T extends Record<string, any>>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    emptyMessage,
    striped = false,
    hoverable = true,
}: TableProps<T>) {
    const { t } = useLanguage();
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-6 py-3 ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : ""} ${
                                    col.fixed ? "sticky left-0 bg-slate-50 z-10" : col.fixedRight ? "sticky right-0 bg-slate-50 z-10" : ""
                                } ${col.className || ""}`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-400">
                                {emptyMessage ?? t("noDataAvailable")}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr
                                key={keyExtractor(item)}
                                className={`${striped && index % 2 === 0 ? "bg-slate-50/50" : "bg-white"} border-b border-slate-200 ${
                                    hoverable ? "hover:bg-slate-50" : ""
                                } ${onRowClick ? "cursor-pointer" : ""}`}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`px-6 py-4 ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : ""} ${
                                            col.fixed ? "sticky left-0 bg-inherit z-10" : col.fixedRight ? "sticky right-0 bg-inherit z-10" : ""
                                        } ${col.className || ""}`}
                                        onClick={(e) => {
                                            // Stop propagation if column has its own click handlers
                                            if (col.render && onRowClick) {
                                                const target = e.target as HTMLElement;
                                                if (target.tagName === "BUTTON" || target.closest("button")) {
                                                    e.stopPropagation();
                                                }
                                            }
                                        }}
                                    >
                                        {col.render ? col.render(item) : item[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
