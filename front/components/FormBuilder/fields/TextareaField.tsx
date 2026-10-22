import React from "react";
import { TextareaFieldConfig, OnChangeHandler } from "../types";

interface TextareaFieldProps {
    field: TextareaFieldConfig;
    value: any;
    onChange: OnChangeHandler;
    error?: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = React.memo(({ field, value, onChange, error }) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(field.name, e.target.value, field.path);
    };

    return (
        <div className={field.containerClassName || "mb-4"}>
            {field.label && (
                <label htmlFor={field.name} className="block text-sm font-medium text-slate-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <textarea
                id={field.name}
                name={field.name}
                value={value || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled}
                rows={field.rows || 4}
                maxLength={field.maxLength}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-slate-100 resize-vertical ${
                    error ? "border-danger" : "border-slate-300"
                } ${field.className || ""}`}
            />

            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
    );
});
