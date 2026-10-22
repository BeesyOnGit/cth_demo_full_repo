import { FormData } from "./types";

/**
 * Get nested value from object using dot notation
 * e.g., getValue({ user: { name: "John" } }, "user.name") => "John"
 */
export const getValue = (obj: FormData, path: string): any => {
    if (!obj || !path) {
        return undefined;
    }
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

/**
 * Set nested value in object using dot notation
 * e.g., setValue({}, "user.name", "John") => { user: { name: "John" } }
 */
export const setValue = (obj: FormData, path: string, value: any): FormData => {
    const keys = path.split(".");
    const result = { ...obj };

    if (keys.length === 1) {
        // Simple case: no nesting
        result[keys[0]] = value;
        return result;
    }

    // Handle nested values immutably
    let current: any = result;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = { ...(current[key] || {}) };
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return result;
};

/**
 * Compress and convert image file
 */
export const compressImage = async (
    file: File,
    options: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
    } = {}
): Promise<string> => {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                let { width, height } = img;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const reader = new FileReader();
                            reader.readAsDataURL(blob);
                            reader.onloadend = () => {
                                resolve(reader.result as string);
                            };
                        } else {
                            reject(new Error("Failed to compress image"));
                        }
                    },
                    "image/jpeg",
                    quality
                );
            };

            img.onerror = reject;
        };

        reader.onerror = reject;
    });
};

/**
 * Validate field value
 */
export const validateField = (value: any, field: { required?: boolean; pattern?: string; minLength?: number; maxLength?: number }): string | null => {
    const isEmpty = value === undefined || value === null || (typeof value === "number" && isNaN(value)) || (typeof value === "string" && !value.trim()) || (Array.isArray(value) && value.length === 0);
    if (field.required && isEmpty) {
        return "This field is required";
    }

    if (field.pattern && typeof value === "string") {
        const regex = new RegExp(field.pattern);
        if (!regex.test(value)) {
            return "Invalid format";
        }
    }

    if (field.minLength && typeof value === "string" && value.length < field.minLength) {
        return `Minimum length is ${field.minLength}`;
    }

    if (field.maxLength && typeof value === "string" && value.length > field.maxLength) {
        return `Maximum length is ${field.maxLength}`;
    }

    return null;
};

/**
 * Format date for input[type="date"]
 */
export const formatDateForInput = (date: Date | string | number): string => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
};

/**
 * Format datetime for input[type="datetime-local"]
 */
export const formatDateTimeForInput = (date: Date | string | number): string => {
    const d = new Date(date);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
