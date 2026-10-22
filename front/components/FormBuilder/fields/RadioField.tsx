import React from "react";
import { RadioFieldConfig, OnChangeHandler } from "../types";

interface RadioFieldProps {
    field: RadioFieldConfig;
    value: any;
    onChange: OnChangeHandler;
    error?: string;
}

export const RadioField: React.FC<RadioFieldProps> = React.memo(({ field, value, onChange, error }) => {
    const handleChange = (optionValue: string | number) => {
        onChange(field.name, optionValue, field.path);
    };

    return (
        <div className={field.containerClassName || "mb-4"}>
            {field.label && (
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="space-y-2">
                {field.options.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={field.name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => handleChange(option.value)}
                            disabled={field.disabled}
                            className="h-4 w-4 border-slate-300 text-accent focus:ring-accent"
                        />
                        <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                ))}
            </div>
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
    );
});
