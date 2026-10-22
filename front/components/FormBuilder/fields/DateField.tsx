import React from "react";
import { DateFieldConfig, OnChangeHandler } from "../types";
import { formatDateForInput, formatDateTimeForInput } from "../utils";
import { Input } from "../../Input";

interface DateFieldProps {
    field: DateFieldConfig;
    value: any;
    onChange: OnChangeHandler;
    error?: string;
}

export const DateField: React.FC<DateFieldProps> = React.memo(({ field, value, onChange, error }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        if (!raw) return onChange(field.name, null, field.path);
        // Time values have no date part: keep the raw "HH:mm" string
        onChange(field.name, field.type === "time" ? raw : new Date(raw).getTime(), field.path);
    };

    // Format value for input
    const formatValue = () => {
        if (!value) return "";

        if (field.type === "datetime-local") {
            return formatDateTimeForInput(value);
        }

        if (field.type === "date") {
            return formatDateForInput(value);
        }

        return value;
    };

    return (
        <div className={field.containerClassName || "mb-4"}>
            <Input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formatValue()}
                onChange={handleChange}
                label={field.label}
                required={field.required}
                disabled={field.disabled}
                min={field.min}
                max={field.max}
                error={error}
                className={field.className}
            />
        </div>
    );
});
