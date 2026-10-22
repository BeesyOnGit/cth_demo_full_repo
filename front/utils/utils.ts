import React from "react";
import { useSearchParams } from "react-router-dom";

export const handleChange = ({ e, setState }: { e: React.ChangeEvent<HTMLInputElement>; setState: React.Dispatch<React.SetStateAction<any>> }) => {
    const { name, value, nonce } = e.target;
    if (!nonce) {
        setState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        return;
    }
    setState((prev) => ({ ...prev, [name]: { ...prev[name], [nonce]: value } }));
};

// Hook to get query param value (reactive - updates when URL changes)
export // Hook to get function that updates query params (works with React Router)
function useQueryParams() {
    const [searchParams, setSearchParams] = useSearchParams();

    const setQueryParam = <T extends string>(querys: { name: string; value: T }[] | string) => {
        if (typeof querys === "string") {
            const newParams = new URLSearchParams(querys);
            setSearchParams(newParams);
            return newParams.toString();
        }

        const newParams = new URLSearchParams(searchParams);
        for (const { name, value } of querys) {
            if (Array.isArray(value)) {
                newParams.set(name, value.join(","));
                continue;
            }
            newParams.set(name, value);
        }
        setSearchParams(newParams);
        return newParams.toString();
    };

    const removeQueryParam = (queryParamName: string | string[]) => {
        const newParams = new URLSearchParams(searchParams);
        // if query param is an array, remove all values
        if (Array.isArray(queryParamName)) {
            for (const param of queryParamName) {
                newParams.delete(param);
            }
        } else {
            newParams.delete(queryParamName);
        }
        setSearchParams(newParams);
        return newParams.toString();
    };

    const resetQueryParams = (exeptions?: string[]) => {
        const newParams = new URLSearchParams(searchParams);

        // Collect all keys into an array first to avoid iterator issues
        const keysToDelete = Array.from(newParams.keys()).filter((key) => !exeptions || !exeptions.includes(key));

        // Delete all keys that are not in the exceptions list
        keysToDelete.forEach((key) => newParams.delete(key));

        setSearchParams(newParams);
        return newParams.toString();
    };

    function useQuery<T extends string>(queryParamName: string, defaultValue?: T): T {
        const [searchParams] = useSearchParams();
        return (searchParams.get(queryParamName) as T) || defaultValue || ("" as T);
    }

    return { setQueryParam, removeQueryParam, useQuery, resetQueryParams };
}

// Non-hook versions (use when you can't use hooks, but won't trigger React re-renders)
export function setQueryParam<T extends string>(queryParamName: string, value: T) {
    const searchParams = new URLSearchParams(window.location.search);
    if (Array.isArray(value)) {
        searchParams.set(queryParamName, value.join(","));
    } else {
        searchParams.set(queryParamName, value);
    }
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState(null, "", newUrl);
}

export function removeQueryParam(queryParamName: string) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(queryParamName);
    const newUrl = searchParams.toString() ? `${window.location.pathname}?${searchParams.toString()}` : window.location.pathname;
    window.history.pushState(null, "", newUrl);
}

export function cleanQueryParams(queryParamName: string[], params?: URLSearchParams): string {
    const searchParams = new URLSearchParams(params ? params.toString() : window.location.search);
    for (const param of queryParamName) {
        searchParams.delete(param);
    }
    return searchParams.toString();
}

export function formatDate({ date, options }: { date: string | Date; options?: Intl.DateTimeFormatOptions }): string {
    const d = new Date(date);
    return d.toLocaleDateString(
        undefined,
        options || {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        },
    );
}

// Returns the formatted number only; callers/fields add the "DA" unit themselves
export function formatMoney(amount: number | string) {
    const num = Number(amount);
    const stored = window.localStorage.getItem("language") || "";
    const lang = ["en", "fr", "ar"].includes(stored) ? stored : "fr";
    return new Intl.NumberFormat(`${lang}-DZ`, { maximumFractionDigits: 2 }).format(Number.isFinite(num) ? num : 0);
}

// Local "YYYY-MM-DD" (toISOString would give the UTC date)
export function todayLocalDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function handleFormChange<T>(setData: React.Dispatch<React.SetStateAction<T>>, name: string, value: any, path?: string) {
    setData((prev) => {
        const newData = { ...prev };

        if (path) {
            // Handle nested values immutably
            const keys = path.split(".");
            let current: any = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...(current[keys[i]] || {}) };
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
        } else {
            newData[name] = value;
        }

        return newData;
    });
}

export function printFile({ fileBlob, name }: { fileBlob: Blob; name?: string }) {
    const blobUrl = URL.createObjectURL(fileBlob);
    const iframe = document.createElement("iframe");

    iframe.style.display = "none"; // Make it invisible
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px"; // Move off-scree
    iframe.src = blobUrl;
    iframe.title = name || "Document";
    // Add to document
    document.body.appendChild(iframe);

    // Wait for PDF to load then print
    iframe.onload = function () {
        try {
            // Try silent print first
            iframe.contentWindow.print();

            // Clean up after printing
            setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(blobUrl);
            }, 1000);
        } catch (e) {
            console.error("Print failed:", e);
            // Fallback: show iframe with print button
            iframe.style.display = "block";
            iframe.style.position = "fixed";
            iframe.style.top = "0";
            iframe.style.left = "0";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.zIndex = "9999";
        }
    };
}

export function arrayToMap<T>({
    arr,
    keyGetter,
    valueGetter,
}: {
    arr: T[];
    keyGetter: (item: T) => string;
    valueGetter: (item: T) => any;
}): Map<string, T> {
    const map = new Map<string, T>();
    arr.forEach((item) => {
        const key = keyGetter(item);
        const value = valueGetter(item);
        map.set(key, value);
    });
    return map;
}
