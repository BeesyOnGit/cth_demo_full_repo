import React from "react";
import { MultiSelectFieldConfig, OnChangeHandler } from "../types";
import { MultiSelect } from "../../MultiSelect";

interface MultiSelectFieldProps {
    field: MultiSelectFieldConfig;
    value: any;
    onChange: OnChangeHandler;
    error?: string;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = React.memo(({ field, value, onChange, error }) => {
    const handleChange = (selected: string[]) => {
        onChange(field.name, selected, field.path);
    };

    return (
        <div className={field.containerClassName || "mb-4"}>
            <MultiSelect label={field.label} options={field.options} selected={value || []} onChange={handleChange} />
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
    );
});
