import React from "react";

interface MultiSelectProps {
    label?: string;
    options: { value: string; label: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
    const toggle = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((s) => s !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    return (
        <div className="w-full">
            {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
            <div className="flex flex-wrap gap-2 rounded-lg border border-slate-300 bg-white p-2 min-h-[2.625rem]">
                {selected.map((val) => {
                    const opt = options.find((o) => o.value === val);
                    return opt ? (
                        <span key={val} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {opt.label}
                            <button type="button" onClick={() => toggle(val)} className="text-slate-400 hover:text-danger">
                                &times;
                            </button>
                        </span>
                    ) : null;
                })}
                {selected.length === 0 && <span className="text-sm text-slate-400 py-1 px-1">Select options...</span>}
            </div>
            {/* Simple dropdown for demo - in prod use Headless UI Popover */}
            <div className="mt-2 flex flex-wrap gap-1">
                {options
                    .filter((o) => !selected.includes(o.value))
                    .map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggle(opt.value)}
                            className="rounded border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 text-slate-600"
                        >
                            + {opt.label}
                        </button>
                    ))}
            </div>
        </div>
    );
};
