import React, { useState, useCallback, useMemo } from "react";
import { FormBuilderProps, FieldConfig, FormData } from "./types";
import { TextField, SelectField, DateField, FileField, TextareaField, CheckboxField, RadioField, MultiSelectField } from "./fields";
import { getValue, setValue, validateField } from "./utils";

const MD_GRID_COLS: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
};

export const FormBuilder: React.FC<FormBuilderProps> = ({ formId, fields, formData, onChange, onSubmit, submitButton, className }) => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = useCallback(
        (name: string, value: any, path?: string) => {
            const fieldPath = path || name;
            const newData = setValue(formData, fieldPath, value);
            onChange(name, value, fieldPath);

            // Clear error for this field
            if (errors[name]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        },
        [formData, onChange, errors]
    );

    const validateForm = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        const validateFieldRecursive = (field: FieldConfig) => {
            if (field.type === "group") {
                field.fields.forEach(validateFieldRecursive);
                return;
            }

            if (field.type === "section") {
                return;
            }

            const value = getValue(formData, field.path || field.name);
            const error = validateField(value, field);

            if (error) {
                newErrors[field.name] = error;
            }
        };

        fields.forEach(validateFieldRecursive);
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }, [fields, formData]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            if (onSubmit) {
                await onSubmit(formData);
            }
        },
        [validateForm, onSubmit, formData]
    );

    const renderField = useCallback(
        (field: FieldConfig, index: number) => {
            // Section separator
            if (field.type === "section") {
                return (
                    <div key={`section-${index}`} className={`my-6 ${field.className || ""}`}>
                        {field.title && <h3 className="text-lg font-semibold text-slate-900 mb-2">{field.title}</h3>}
                        {field.description && <p className="text-sm text-slate-600">{field.description}</p>}
                        <div className="mt-4 border-t border-slate-200" />
                    </div>
                );
            }

            // Field group (horizontal layout)
            if (field.type === "group") {
                return (
                    <div
                        key={`group-${index}`}
                        className={`grid grid-cols-1 ${MD_GRID_COLS[field.length || field.fields.length] || "md:grid-cols-6"} gap-4 ${field.className || ""}`}
                    >
                        {field.fields.map((subField, subIndex) => renderField(subField, subIndex))}
                    </div>
                );
            }

            const value = getValue(formData, field.path || field.name);
            const error = errors[field.name];

            // Render appropriate field component
            switch (field.type) {
                case "text":
                case "email":
                case "password":
                case "number":
                case "tel":
                    return <TextField key={field.name} field={field} value={value} onChange={handleChange} error={error} />;

                case "select":
                    return <SelectField key={field.name} field={field} value={value} onChange={handleChange} error={error} />;

                case "date":
                case "datetime-local":
                case "time":
                    return <DateField key={field.name} field={field} value={value} onChange={handleChange} error={error} />;

                case "file":
                    return <FileField key={field.name} field={field} value={value} onChange={handleChange} error={error} />;

                case "textarea":
                    return <TextareaField key={field.name} field={field} value={value} onChange={handleChange} error={error} />;

                case "checkbox":
                    return <CheckboxField key={field.name} field={field} value={value} onChange={handleChange} error={error} />;

                case "radio":
                    return <RadioField key={field.name} field={field} value={value} onChange={handleChange} error={error} />;

                case "multiselect":
                    return <MultiSelectField key={field.name} field={field} value={value} onChange={handleChange} error={error} />;

                default:
                    return null;
            }
        },
        [formData, errors, handleChange]
    );

    return (
        <form id={formId} onSubmit={handleSubmit} className={className}>
            {fields.map((field, index) => renderField(field, index))}

            {submitButton && (
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={submitButton.loading}
                        className={`px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed ${
                            submitButton.className || ""
                        }`}
                    >
                        {submitButton.loading ? "Submitting..." : submitButton.label || "Submit"}
                    </button>
                </div>
            )}
        </form>
    );
};
