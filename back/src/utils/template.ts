import fs from "fs/promises";
import path from "path";
import { boolean } from "zod";

interface TemplateData {
    [key: string]: any;
}
export type SituationTemplate = {
    defintitive: boolean;

    company: {
        code?: string;
        name?: string;
        address?: string;
        nif?: string;
        nis?: string;
        rc?: string;
    };
    client: {
        code?: string;
        name?: string;
        address?: string;
    };
    project: {
        code?: string;
        name?: string;
        reference?: string;
    };
};

const templatesDir = path.join(__dirname, "..", "templates");

/**
 * Template Engine for rendering HTML with variable interpolation and loops
 *
 * Supported syntax:
 * - Variables: {{variable}} or {{object.property}}
 * - Loops: {{#each arrayName}}...{{/each}}
 * - Loop item access: {{this}} or {{this.property}}
 * - Loop index: {{@index}}
 * - Conditionals: {{#if condition}}...{{/if}}
 */
export class TemplateEngine {
    /**
     * Load and render a template file
     * @param templateName Name of the HTML template file
     * @param data Data object containing values to replace in template
     * @returns Rendered HTML string
     */
    static async renderFile(templateName: string, data: TemplateData): Promise<string> {
        // console.log("🚀 ~ file: template.ts:51 ~ TemplateEngine ~ renderFile ~ data:", data);
        try {
            const template = await fs.readFile(`${templatesDir}/${templateName}.html`, "utf-8");
            let y = this.render(template, data);
            await fs.writeFile(`${templatesDir}/output_${templateName}.html`, y);
            return y;
        } catch (error) {
            throw new Error(`Error loading template file: ${error}`);
        }
    }

    /**
     * Render a template string with provided data
     * @param template Template string with template syntax
     * @param data Data object containing values to replace in template
     * @returns Rendered string
     */
    static render(template: string, data: TemplateData): string {
        let result = template;

        // Process loops first (they may contain other template syntax)
        result = this.processLoops(result, data);

        // Process conditionals
        result = this.processConditionals(result, data);

        // Process variable interpolation
        result = this.processVariables(result, data);

        return result;
    }

    /**
     * Process loop blocks {{#each array}}...{{/each}}
     */
    private static processLoops(template: string, data: TemplateData): string {
        const loopRegex = /\{\{#each\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/each\}\}/g;
        console.log("🚀 ~ file: template.ts:88 ~ TemplateEngine ~ processLoops ~ loopRegex:", loopRegex);
        console.log("🚀 ~ file: template.ts:87 ~ TemplateEngine ~ processLoops ~ data:", data);

        return template.replace(loopRegex, (match, arrayName, content) => {
            console.log("🚀 ~ file: template.ts:91 ~ TemplateEngine ~ returntemplate.replace ~ match:", match);
            const array = this.getNestedValue(data, arrayName);

            if (!Array.isArray(array)) {
                return "";
            }

            return array
                .map((item, index) => {
                    let itemContent = content;
                    console.log("🚀 ~ file: template.ts:99 ~ TemplateEngine ~ .map ~ itemContent:", itemContent);
                    console.log("🚀 ~ file: template.ts:98 ~ TemplateEngine ~ .map ~ item:", item);

                    // Replace {{@index}} with current index (1-based for display)
                    itemContent = itemContent.replace(/\{\{@index\}\}/g, (index + 1).toString());

                    // Replace {{this}} with the item itself (for primitive arrays)
                    if (typeof item !== "object") {
                        itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
                    } else {
                        // Replace {{this.property}} with item properties
                        // @ts-ignore
                        itemContent = itemContent.replace(/\{\{this\.(\w+(?:\.\w+)*)\}\}/g, (_, prop) => {
                            const value = this.getNestedValue(item, prop);
                            return value !== undefined ? String(value) : "";
                        });

                        // Replace {{this}} with JSON representation
                        itemContent = itemContent.replace(/\{\{this\}\}/g, JSON.stringify(item));
                    }

                    return itemContent;
                })
                .join("");
        });
    }

    /**
     * Process conditional blocks {{#if condition}}...{{/if}}
     */
    private static processConditionals(template: string, data: TemplateData): string {
        const ifRegex = /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g;

        return template.replace(ifRegex, (match, condition, content) => {
            const value = this.getNestedValue(data, condition);

            // Check if condition is truthy
            if (value && (Array.isArray(value) ? value.length > 0 : true)) {
                return content;
            }

            return "";
        });
    }

    /**
     * Process variable interpolation {{variable}} or {{object.property}}
     */
    private static processVariables(template: string, data: TemplateData): string {
        const variableRegex = /\{\{(\w+(?:\.\w+)*)\}\}/g;

        return template.replace(variableRegex, (match, variable) => {
            const value = this.getNestedValue(data, variable);
            return value !== undefined ? String(value) : "";
        });
    }

    /**
     * Get nested value from object using dot notation
     * @param obj Object to search in
     * @param path Dot-separated path (e.g., "project.name")
     * @returns Value at the path or undefined
     */
    private static getNestedValue(obj: any, path: string): any {
        if (!path) return undefined;

        const keys = path.split(".");
        let value = obj;

        for (const key of keys) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[key];
        }

        return value;
    }
}

/**
 * Convenience function to render a template file
 * @param templatePath Path to the HTML template file
 * @param data Data object containing values to replace in template
 * @returns Rendered HTML string
 */
export async function renderTemplate(templatePath: string, data: TemplateData): Promise<string> {
    return TemplateEngine.renderFile(templatePath, data);
}

/**
 * Convenience function to render a template string
 * @param template Template string with template syntax
 * @param data Data object containing values to replace in template
 * @returns Rendered string
 */
export function renderTemplateString(template: string, data: TemplateData): string {
    return TemplateEngine.render(template, data);
}

// functiona to format number as currency
export function formatCurrency(amount: number, currency: string = "DA", locale: string = "fr-DZ"): string {
    return new Intl.NumberFormat(locale, { style: "currency", currency: "DZD" }).format(amount);
}
