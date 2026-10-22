import React from "react";
import { TextFieldConfig, OnChangeHandler } from "../types";
import { Input } from "../../Input";

interface TextFieldProps {
    field: TextFieldConfig;
    value: any;
    onChange: OnChangeHandler;
    error?: string;
}

export const TextField: React.FC<TextFieldProps> = React.memo(({ field, value, onChange, error }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = field.type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value;
        onChange(field.name, newValue, field.path);
    };

    // Format the displayed value if formatDisplay is provided
    const displayValue = field.formatDisplay && value != null ? field.formatDisplay(value) : value ?? "";

    return (
        <div className={field.containerClassName || "mb-4"}>
            <Input
                id={field.name}
                name={field.name}
                type={field.type}
                value={displayValue}
                onChange={handleChange}
                label={field.label}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled}
                pattern={field.pattern}
                minLength={field.minLength}
                maxLength={field.maxLength}
                min={field.min}
                max={field.max}
                error={error}
                className={field.className}
                prefix={field.prefix}
                suffix={field.suffix}
            />
        </div>
    );
});
