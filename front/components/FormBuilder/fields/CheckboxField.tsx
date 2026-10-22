import React from "react";
import { CheckboxFieldConfig, OnChangeHandler } from "../types";

interface CheckboxFieldProps {
    field: CheckboxFieldConfig;
    value: any;
    onChange: OnChangeHandler;
    error?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = React.memo(({ field, value, onChange, error }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(field.name, e.target.checked, field.path);
    };

    return (
        <div className={field.containerClassName || "mb-4"}>
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    checked={value || false}
                    onChange={handleChange}
                    disabled={field.disabled}
                    className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                />
                {field.label && <span className="text-sm text-slate-700">{field.label}</span>}
            </label>
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
    );
});
