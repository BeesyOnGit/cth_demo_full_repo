import React, { useState } from "react";
import { FileFieldConfig, OnChangeHandler } from "../types";
import { compressImage } from "../utils";
import { Upload, X } from "lucide-react";

interface FileFieldProps {
    field: FileFieldConfig;
    value: any;
    onChange: OnChangeHandler;
    error?: string;
}

export const FileField: React.FC<FileFieldProps> = React.memo(({ field, value, onChange, error }) => {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [loading, setLoading] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (field.maxSize && file.size > field.maxSize) {
            alert(`File size must be less than ${(field.maxSize / 1024 / 1024).toFixed(2)}MB`);
            return;
        }

        setLoading(true);

        try {
            // Compress image if it's an image file and compression is enabled
            if (field.compression && file.type.startsWith("image/")) {
                const compressed = await compressImage(file, field.compression);
                setPreview(compressed);
                onChange(field.name, compressed, field.path);
            } else {
                // Convert to base64 for non-image files or if compression is disabled
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    setPreview(result);
                    onChange(field.name, result, field.path);
                };
                reader.readAsDataURL(file);
            }
        } catch (err) {
            console.error("Error processing file:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange(field.name, null, field.path);
    };

    return (
        <div className={field.containerClassName || "mb-4"}>
            {field.label && (
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="space-y-2">
                {preview && field.preview ? (
                    <div className="relative inline-block">
                        <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-slate-300" />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <label
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 ${
                            error ? "border-red-500" : "border-slate-300"
                        } ${field.className || ""}`}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-slate-400" />
                            <p className="text-sm text-slate-600">{loading ? "Processing..." : field.placeholder || "Click to upload"}</p>
                            {field.accept && <p className="text-xs text-slate-500 mt-1">{field.accept}</p>}
                        </div>
                        <input
                            id={field.name}
                            name={field.name}
                            type="file"
                            accept={field.accept}
                            multiple={field.multiple}
                            onChange={handleChange}
                            disabled={field.disabled || loading}
                            className="hidden"
                        />
                    </label>
                )}
            </div>

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
});
