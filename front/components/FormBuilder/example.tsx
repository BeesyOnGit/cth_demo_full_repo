/**
 * EXAMPLE USAGE
 *
 * This file shows how to use the FormBuilder component
 * Delete this file when you're ready to use the FormBuilder
 */

import React, { useState } from "react";
import { FormBuilder, FieldConfig, FormData } from "./index";

export const ExampleForm = () => {
    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: {
            wilaya: "",
            commune: "",
            street: "",
        },
        birthDate: null,
        bio: "",
        profilePicture: null,
        newsletter: false,
        gender: "",
        skills: [],
        interests: [],
    });

    const [loading, setLoading] = useState(false);

    // Define your form fields
    const fields: FieldConfig[] = [
        // Section: Personal Information
        {
            type: "section",
            title: "Personal Information",
            description: "Tell us about yourself",
        },

        // Grouped fields (horizontal layout)
        {
            type: "group",
            fields: [
                {
                    type: "text",
                    name: "firstName",
                    label: "First Name",
                    placeholder: "John",
                    required: true,
                },
                {
                    type: "text",
                    name: "lastName",
                    label: "Last Name",
                    placeholder: "Doe",
                    required: true,
                },
            ],
        },

        // Profile picture upload
        {
            type: "file",
            name: "profilePicture",
            label: "Profile Picture",
            accept: "image/*",
            preview: true,
            compression: {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.8,
            },
        },

        // Contact fields
        {
            type: "email",
            name: "email",
            label: "Email",
            placeholder: "john.doe@example.com",
            required: true,
        },
        {
            type: "tel",
            name: "phone",
            label: "Phone Number",
            placeholder: "0555123456",
            pattern: "[0-9]{10}",
        },

        // Date field
        {
            type: "date",
            name: "birthDate",
            label: "Date of Birth",
            max: new Date().toISOString().split("T")[0],
        },

        // Section: Address
        {
            type: "section",
            title: "Address Information",
        },

        // Select fields for address
        {
            type: "select",
            name: "wilaya",
            path: "address.wilaya", // Nested path
            label: "Wilaya",
            required: true,
            options: [
                { label: "Alger", value: "16" },
                { label: "Oran", value: "31" },
                { label: "Constantine", value: "25" },
            ],
        },
        {
            type: "select",
            name: "commune",
            path: "address.commune",
            label: "Commune",
            required: true,
            options: [
                { label: "Bab Ezzouar", value: "1" },
                { label: "Hydra", value: "2" },
            ],
        },
        {
            type: "text",
            name: "street",
            path: "address.street",
            label: "Street Address",
            placeholder: "123 Main Street",
        },

        // Textarea
        {
            type: "textarea",
            name: "bio",
            label: "Bio",
            placeholder: "Tell us about yourself...",
            rows: 5,
            maxLength: 500,
        },

        // Section: Preferences
        {
            type: "section",
            title: "Preferences",
        },

        // Radio buttons
        {
            type: "radio",
            name: "gender",
            label: "Gender",
            required: true,
            options: [
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
            ],
        },

        // Multi-select for skills
        {
            type: "multiselect",
            name: "skills",
            label: "Skills",
            options: [
                { label: "JavaScript", value: "js" },
                { label: "TypeScript", value: "ts" },
                { label: "React", value: "react" },
                { label: "Node.js", value: "node" },
                { label: "Python", value: "python" },
                { label: "Java", value: "java" },
            ],
        },

        // Multi-select for interests
        {
            type: "multiselect",
            name: "interests",
            label: "Interests",
            options: [
                { label: "Web Development", value: "web" },
                { label: "Mobile Development", value: "mobile" },
                { label: "Machine Learning", value: "ml" },
                { label: "DevOps", value: "devops" },
                { label: "Design", value: "design" },
            ],
        },

        // Checkbox
        {
            type: "checkbox",
            name: "newsletter",
            label: "Subscribe to newsletter",
        },
    ];

    // Handle field changes
    const handleChange = (name: string, value: any, path?: string) => {
        setFormData((prev) => {
            const newData = { ...prev };

            if (path) {
                // Handle nested values
                const keys = path.split(".");
                let current: any = newData;

                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }

                current[keys[keys.length - 1]] = value;
            } else {
                newData[name] = value;
            }

            return newData;
        });
    };

    // Handle form submission
    const handleSubmit = async (data: FormData) => {
        setLoading(true);

        try {
            console.log("Form submitted:", data);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            alert("Form submitted successfully!");
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Error submitting form");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Form Builder Example</h1>

            <FormBuilder
                fields={fields}
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                // submitButton={{
                //     label: "Submit Form",
                //     loading,
                // }}
                className="bg-white p-6 rounded-lg shadow"
            />
        </div>
    );
};
