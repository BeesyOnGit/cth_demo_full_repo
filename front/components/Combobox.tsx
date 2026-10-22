import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

interface ComboboxProps {
    label?: string;
    options: { value: string | number; label: string }[];
    value?: string | number | (string | number)[];
    onChange: (value: string | number | (string | number)[]) => void;
    placeholder?: string;
    error?: string;
    isMulti?: boolean;
    disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
    label,
    options,
    value,
    onChange,
    placeholder = "Select...",
    error,
    isMulti = false,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedValues = isMulti ? (Array.isArray(value) ? value : []) : [];
    const selectedOption = !isMulti ? options.find((o) => o.value === value) : null;
    const selectedOptions = isMulti ? options.filter((o) => selectedValues.includes(o.value)) : [];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredOptions = options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));

    const handleToggleOption = (optValue: string | number) => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            if (currentValues.includes(optValue)) {
                onChange(currentValues.filter((v) => v !== optValue));
            } else {
                onChange([...currentValues, optValue]);
            }
        } else {
            onChange(optValue);
            setIsOpen(false);
            setSearch("");
        }
    };

    const handleRemoveTag = (optValue: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMulti && Array.isArray(value)) {
            onChange(value.filter((v) => v !== optValue));
        }
    };

    return (
        <div className="w-full relative" ref={wrapperRef}>
            {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
            <div
                // when disabled change style here too
                className={`w-full rounded-lg border ${
                    disabled ? "bg-slate-100 cursor-default" : "bg-white"
                } px-3 py-2 text-sm text-slate-900 cursor-pointer ${error ? "border-danger" : disabled ? "border-slate-300" : "border-slate-300"}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isMulti ? (
                    <div className="flex flex-wrap gap-1 min-h-[20px]">
                        {selectedOptions.length > 0 ? (
                            selectedOptions.map((opt) => (
                                <span key={opt.value} className="inline-flex items-center gap-1 bg-sky-100 text-accent px-2 py-0.5 rounded text-xs">
                                    {opt.label}
                                    <X size={12} className="cursor-pointer hover:text-red-600" onClick={(e) => handleRemoveTag(opt.value, e)} />
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-400">{placeholder}</span>
                        )}
                    </div>
                ) : (
                    // if disabled change style to disabled
                    <div className={`flex justify-between items-center ${disabled ? "opacity-50" : ""}`}>
                        <span className={selectedOption ? "text-slate-900" : "text-slate-400"}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                        <ChevronDown size={16} className="text-slate-400" />
                    </div>
                )}
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                        <input
                            type="text"
                            className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-accent"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                            disabled={disabled}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => {
                            const isSelected = isMulti ? selectedValues.includes(opt.value) : value === opt.value;
                            return (
                                <div
                                    key={opt.value}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 flex items-center justify-between ${
                                        isSelected ? "bg-sky-50 text-accent" : "text-slate-700"
                                    }`}
                                    onClick={() => handleToggleOption(opt.value)}
                                >
                                    {opt.label}
                                    {isSelected && <Check size={14} />}
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-3 py-2 text-sm text-slate-400 italic">No options found</div>
                    )}
                </div>
            )}
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
    );
};
