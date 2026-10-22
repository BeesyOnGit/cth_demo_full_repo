import { ChangeEvent } from "react";

// Base field configuration
export interface BaseFieldConfig {
    name: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    containerClassName?: string;
    path?: string; // For nested objects (e.g., "address.street")
    formatDisplay?: (value: any) => string; // Format the displayed value
    prefix?: string; // Unit/symbol before input (e.g., "$")
    suffix?: string; // Unit/symbol after input (e.g., "kg", "%")
}

// Text input field
export interface TextFieldConfig extends BaseFieldConfig {
    type: "text" | "email" | "password" | "number" | "tel";
    defaultValue?: string;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

// Select/Dropdown field
export interface SelectFieldConfig extends BaseFieldConfig {
    type: "select";
    options: Array<{ label: string; value: string | number }>;
    defaultValue?: string | number | (string | number)[];
    isMulti?: boolean;
    disabled?: boolean;
}

// Date field
export interface DateFieldConfig extends BaseFieldConfig {
    type: "date" | "datetime-local" | "time";
    defaultValue?: string;
    min?: string;
    max?: string;
}

// File upload field
export interface FileFieldConfig extends BaseFieldConfig {
    type: "file";
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in bytes
    preview?: boolean;
    compression?: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
    };
}

// Textarea field
export interface TextareaFieldConfig extends BaseFieldConfig {
    type: "textarea";
    defaultValue?: string;
    rows?: number;
    maxLength?: number;
}

// Checkbox field
export interface CheckboxFieldConfig extends BaseFieldConfig {
    type: "checkbox";
    defaultValue?: boolean;
}

// Radio group field
export interface RadioFieldConfig extends BaseFieldConfig {
    type: "radio";
    options: Array<{ label: string; value: string | number }>;
    defaultValue?: string | number;
}

// Section separator
export interface SectionConfig {
    type: "section";
    title?: string;
    description?: string;
    className?: string;
}

// Field group (for horizontal layouts)
export interface FieldGroupConfig {
    type: "group";
    fields: FieldConfig[];
    className?: string;
    length?: number; // Number of fields per row
}

// Multi-select field
export interface MultiSelectFieldConfig extends BaseFieldConfig {
    type: "multiselect";
    options: Array<{ label: string; value: string }>;
    defaultValue?: string[];
}

// Union type of all field configurations
export type FieldConfig =
    | TextFieldConfig
    | SelectFieldConfig
    | DateFieldConfig
    | FileFieldConfig
    | TextareaFieldConfig
    | CheckboxFieldConfig
    | RadioFieldConfig
    | MultiSelectFieldConfig
    | SectionConfig
    | FieldGroupConfig;

// Form data structure
export type FormData = Record<string, any>;

// Change handler type
export type OnChangeHandler = (name: string, value: any, path?: string) => void;

// Form configuration
export interface FormBuilderProps {
    fields: FieldConfig[];
    formId?: string;
    formData: FormData;
    onChange: OnChangeHandler;
    onSubmit?: (data: any) => void | Promise<void>;
    submitButton?: {
        label?: string;
        className?: string;
        loading?: boolean;
    };
    className?: string;
}

// Field renderer props
export interface FieldRendererProps {
    field: FieldConfig;
    value: any;
    onChange: OnChangeHandler;
    error?: string;
}
