import React from "react";
import { SelectFieldConfig, OnChangeHandler } from "../types";
import { Combobox } from "../../Combobox";

interface SelectFieldProps {
    field: SelectFieldConfig;
    value: any;
    onChange: OnChangeHandler;
    error?: string;
    isMulti?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = React.memo(({ field, value, onChange, error, isMulti }) => {
    const handleChange = (newValue: string) => {
        onChange(field.name, newValue, field.path);
    };

    return (
        <div className={field.containerClassName || "mb-4"}>
            <Combobox
                label={field.label}
                options={field.options}
                value={value || ""}
                onChange={handleChange}
                placeholder={field.placeholder || "Select..."}
                error={error}
                isMulti={field.isMulti}
                disabled={field.disabled}
            />
        </div>
    );
});
