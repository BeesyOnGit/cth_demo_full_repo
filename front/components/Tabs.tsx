import { useQueryParams } from "@/utils/utils";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export type TabItem<T extends string = string> = {
    id: T;
    label: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
};

type TabsProps<T extends string> = {
    tabs: TabItem<T>[];
    defaultTab?: T;
    queryParamName?: string;
    onChange?: (tabId: T) => void;
    className?: string;
    useRouting?: boolean; // If true, uses onChange for navigation instead of query params
    activeTab?: T; // For controlled mode when using routing
};

export function Tabs<T extends string>({
    tabs,
    defaultTab,
    queryParamName = "tab",
    onChange,
    className = "",
    useRouting = false,
    activeTab,
}: TabsProps<T>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { setQueryParam } = useQueryParams();

    // Use activeTab prop if provided (routing mode), otherwise use query params
    const activeTabId = useRouting && activeTab ? activeTab : (searchParams.get(queryParamName) as T) || defaultTab || tabs[0]?.id;

    useEffect(() => {
        if (!useRouting) {
            if (activeTabId !== defaultTab) {
                setQueryParam([{ name: queryParamName, value: defaultTab }]);
                return;
            }
            setQueryParam([{ name: queryParamName, value: activeTabId }]);
        }
    }, [useRouting]);

    const handleTabChange = (tabId: T) => {
        if (useRouting) {
            // In routing mode, just call onChange
            if (onChange) {
                onChange(tabId);
            }
        } else {
            // In query param mode, update URL params
            const newParams = new URLSearchParams(searchParams);
            newParams.set(queryParamName, tabId);
            setSearchParams(newParams);

            if (onChange) {
                onChange(tabId);
            }
        }
    };

    return (
        <div
            className={`border-b border-border overflow-y-hidden overflow-x-auto scrollbar-hide ${className}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            <nav className="-mb-px flex space-x-6 min-w-max" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium flex items-center gap-2 transition-colors hover:cursor-pointer ${
                            activeTabId === tab.id
                                ? "border-accent text-accent"
                                : "border-transparent text-secondary hover:border-slate-300 hover:text-primary"
                        }`}
                    >
                        {tab.icon && <tab.icon size={16} />}
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}

export function useActiveTab<T extends string>(queryParamName: string = "tab", defaultTab?: T): T {
    const [searchParams] = useSearchParams();
    return (searchParams.get(queryParamName) as T) || defaultTab || ("" as T);
}
