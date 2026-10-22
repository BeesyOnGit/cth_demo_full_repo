import { useCallback, useEffect, useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Filter, Search, X } from "lucide-react";
import { FormBuilder, FormBuilderProps } from "./FormBuilder";
import { handleFormChange, useQueryParams } from "@/utils/utils";
import { useLanguage } from "@/i18n";
import { useSearchParams } from "react-router-dom";

type FilterType = {
    queryName?: string;
    placeholder?: string;
    noClearParams?: string[];
    noSearch?: boolean;
    onSubmit: (query: string) => void;
};
export type FilterProps = ({ moreFilters: true } & FilterType & Partial<FormBuilderProps>) | ({ moreFilters?: false } & FilterType);

function FilterQuery(props: FilterProps) {
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();

    const { queryName = "search", placeholder, moreFilters = false, noClearParams, onSubmit, noSearch } = props;

    const { setQueryParam, useQuery, removeQueryParam, resetQueryParams } = useQueryParams();

    const search = useQuery(queryName);

    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(search || "");
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [canReset, setCanReset] = useState(false);

    // Initialize formData from URL params on mount
    useEffect(() => {
        const params: { [key: string]: any } = {};
        searchParams.forEach((value, key) => {
            // Exclude navigation params - only include filter params
            if (key !== queryName && key !== "tab" && key !== "page" && key !== "edit" && key !== "delete") {
                params[key] = value;
            }
        });
        setFormData(params);
    }, []);

    useEffect(() => {
        if (JSON.stringify(formData) === "{}" && canReset) {
            setCanReset(false);
            return;
        }
        if (!canReset) {
            setCanReset(true);
        }
    }, [formData]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // If search is cleared, remove query param and trigger data refresh
        if (!val) {
            const query = removeQueryParam([queryName, "page"]);
            onSubmit(query);
        }

        // Update local state
        setSearchInput(val);
    };

    const applySearch = () => {
        // If search is empty, do nothing
        if (!searchInput.trim()) {
            return;
        }

        // Set query param (back to first page)
        const params = new URLSearchParams(searchParams);
        params.set(queryName, searchInput.trim());
        params.delete("page");
        const query = setQueryParam(params.toString());

        // Trigger data refresh
        onSubmit(query);
    };

    // Handle Enter key press in search input
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            applySearch();
        }
    };

    const handleFilterChange = useCallback(
        (name: string, value: any, path?: string) => {
            // Read all current params from searchParams (React Router's state)
            const query = new URLSearchParams(searchParams.toString());
            // Update the specific param
            query.set(name, Array.isArray(value) ? value.join(",") : value);
            query.delete("page");
            // Set all params at once
            setQueryParam(query.toString());

            // Update local form data state
            handleFormChange(setFormData, name, value, path);
        },
        [searchParams, setQueryParam],
    );

    // Reset Filters
    const handleResetFilters = () => {
        // Clear State
        setFormData({});
        // Clear URL Params
        const query = resetQueryParams(noClearParams);
        // Refresh data
        moreFilters && "onSubmit" in props && props.onSubmit(query);
    };

    const handleApplyFilters = () => {
        // Refresh data with new filters
        moreFilters && "onSubmit" in props && props.onSubmit(searchParams.toString());
    };
    return (
        <div className="space-y-3 w-full">
            <div className="flex gap-3 items-center">
                {!noSearch && (
                    <>
                        <div className="relative flex-1 max-w-md">
                            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 " size={18} /> */}
                            <Input
                                type="text"
                                placeholder={placeholder || `Search`}
                                value={searchInput}
                                onChange={handleSearch}
                                onKeyDown={handleSearchKeyDown}
                                className="w-full "
                            />
                        </div>
                        <Button onClick={applySearch} variant="primary">
                            <Search size={18} className="me-2" />
                            {t("Search")}
                        </Button>
                    </>
                )}
                {moreFilters && (
                    <Button onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)} variant="outline">
                        <Filter size={18} className="me-2" />
                        {t("Filters")}
                    </Button>
                )}
            </div>

            {/* Advanced Filters Section - Collapsible */}
            <div
                className={`overflow-y-scroll transition-all duration-300 ease-in-out ${
                    isFilterDrawerOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div
                    className={`bg-surface border border-border rounded-lg p-4 shadow-sm transform transition-transform duration-300 ${
                        isFilterDrawerOpen ? "translate-y-0" : "-translate-y-4"
                    }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-primary">{t("Advanced Filters")}</h3>
                        <button onClick={() => setIsFilterDrawerOpen(false)} className="p-1 hover:bg-slate-100 rounded transition-colors">
                            <X size={16} className="text-secondary" />
                        </button>
                    </div>

                    <div className="w-full ">
                        {moreFilters && "fields" in props && (
                            <FormBuilder
                                className="w-full"
                                fields={props.fields}
                                formData={formData}
                                onChange={handleFilterChange}
                                onSubmit={handleApplyFilters}
                                formId={props.formId}
                            />
                        )}
                    </div>

                    {moreFilters && "formId" in props && (
                        <div className="flex gap-3 mt-4 justify-end">
                            <Button variant="outline" onClick={handleResetFilters} disabled={!canReset}>
                                {t("Reset")}
                            </Button>
                            <Button variant="primary" type="submit" form={props.formId} disabled={!canReset}>
                                {t("Apply Filters")}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FilterQuery;
