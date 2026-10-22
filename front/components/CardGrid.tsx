import React from "react";

export type CardColumn<T> = {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
    align?: "left" | "center" | "right";
    fixed?: boolean;
};

type CardGridProps<T> = {
    columns: CardColumn<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    onCardClick?: (item: T) => void;
    emptyMessage?: string;
    gridCols?: 1 | 2 | 3 | 4;
    CardComponent?: React.ComponentType<{ item: T; onClick?: () => void }>;
};

export function CardGrid<T extends Record<string, any>>({
    columns,
    data,
    keyExtractor,
    onCardClick,
    emptyMessage = "noDataAvailable",
    gridCols,
    CardComponent,
}: CardGridProps<T>) {
    if (data?.length === 0) {
        return <div className="text-center py-12 text-slate-400">{emptyMessage}</div>;
    }

    // If custom card component is provided, use it
    if (CardComponent) {
        // Auto-determine grid columns if not specified
        let finalGridCols = gridCols || 3;

        const gridColsClass = {
            1: "grid-cols-1",
            2: "grid-cols-1 md:grid-cols-2",
            3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        };

        return (
            <div className={`grid ${gridColsClass[finalGridCols]} gap-6`}>
                {data.map((item) => (
                    <CardComponent key={keyExtractor(item)} item={item} onClick={() => onCardClick?.(item)} />
                ))}
            </div>
        );
    }

    // Separate actions column from content columns
    const contentColumns = columns.filter((col) => col.key !== "actions");
    const actionsColumn = columns.find((col) => col.key === "actions");

    // Auto-determine grid columns if not specified
    let finalGridCols = gridCols;
    if (!finalGridCols) {
        const fieldCount = contentColumns.length;
        // Simple cards (1-3 fields) -> 4 columns
        // Medium cards (4-6 fields) -> 3 columns
        // Complex cards (7+ fields) -> 2 columns
        if (fieldCount <= 3) {
            finalGridCols = 4;
        } else if (fieldCount <= 6) {
            finalGridCols = 3;
        } else {
            finalGridCols = 2;
        }
    }

    const gridColsClass = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={`grid ${gridColsClass[finalGridCols]} gap-6`}>
            {data.map((item) => (
                <div
                    key={keyExtractor(item)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-accent/50 hover:shadow-md"
                >
                    {/* Card Content */}
                    <div
                        className={`p-5 ${onCardClick && !actionsColumn ? "cursor-pointer" : ""}`}
                        onClick={() => !actionsColumn && onCardClick?.(item)}
                    >
                        <div className="space-y-3">
                            {contentColumns.map((col, index) => (
                                <div key={col.key} className={col.className || ""}>
                                    {index > 0 && <div className="text-xs text-slate-500 uppercase mb-1">{col.label}</div>}
                                    <div className={`text-slate-800 ${index === 0 ? "font-semibold text-slate-900" : "text-sm"}`}>
                                        {col.render ? col.render(item) : item[col.key]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions Footer */}
                    {actionsColumn && (
                        <div className="bg-slate-50 px-4 py-3 flex gap-2 border-t border-slate-100">
                            {actionsColumn.render ? actionsColumn.render(item) : null}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
