import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";

interface TemplateData {
    [key: string]: any;
}

const templatesDir = path.join(__dirname, "..", "templates");

/**
 * Handlebars Template Engine for rendering HTML templates
 *
 * Supported Handlebars syntax:
 * - Variables: {{variable}} or {{object.property}}
 * - Loops: {{#each array}}...{{/each}}
 * - Loop item access: {{this}} or {{this.property}}
 * - Loop index: {{@index}}
 * - Conditionals: {{#if condition}}...{{else}}...{{/if}}
 * - Unless: {{#unless condition}}...{{/unless}}
 * - Comparison helpers: {{#if (eq a b)}}
 */
export class HandlebarsTemplateEngine {
    private static isInitialized = false;

    /**
     * Initialize Handlebars with custom helpers
     */
    private static initialize(): void {
        if (this.isInitialized) return;

        // Register comparison helpers
        Handlebars.registerHelper("eq", (a: any, b: any) => a === b);
        Handlebars.registerHelper("ne", (a: any, b: any) => a !== b);
        Handlebars.registerHelper("lt", (a: any, b: any) => a < b);
        Handlebars.registerHelper("gt", (a: any, b: any) => a > b);
        Handlebars.registerHelper("lte", (a: any, b: any) => a <= b);
        Handlebars.registerHelper("gte", (a: any, b: any) => a >= b);
        Handlebars.registerHelper("and", (a: any, b: any) => a && b);
        Handlebars.registerHelper("or", (a: any, b: any) => a || b);
        Handlebars.registerHelper("not", (a: any) => !a);

        // Register currency formatter helper
        Handlebars.registerHelper("formatCurrency", (amount: number, currency: string = "DA") => {
            if (amount === undefined || amount === null) return formatCurrency(0, currency);
            return formatCurrency(amount, currency);
        });

        // Register date formatter helper
        Handlebars.registerHelper("formatDate", (date: Date | string, format: string = "DD/MM/YYYY") => {
            if (!date) return "";
            const d = typeof date === "string" ? new Date(date) : date;
            if (!d || isNaN(d.getTime())) return "";
            if (format === "DD/MM/YYYY") {
                return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
            }
            return d.toLocaleDateString();
        });

        // Register number formatter helper
        Handlebars.registerHelper("formatNumber", (num: number, decimals: number = 2) => {
            if (num === undefined || num === null) return "0.00";
            return num.toFixed(decimals);
        });

        // Register uppercase helper
        Handlebars.registerHelper("uppercase", (str: string) => {
            return str ? str.toUpperCase() : "";
        });

        // Register lowercase helper
        Handlebars.registerHelper("lowercase", (str: string) => {
            return str ? str.toLowerCase() : "";
        });
        // Register Capitalize every word helper

        Handlebars.registerHelper("capitalize", (str: string) => {
            return str
                ? str
                      .split(" ")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(" ")
                : "";
        });

        // Register default value helper
        Handlebars.registerHelper("default", (value: any, defaultValue: any) => {
            return value !== undefined && value !== null ? value : defaultValue;
        });

        // Register number to French words helper (for invoices)
        Handlebars.registerHelper("numberToWords", (num: number) => {
            if (num === undefined || num === null || num === 0) return "zéro";
            if (num < 0) return "moins " + numberToWordsFr(Math.abs(num));
            return numberToWordsFr(num);
        });

        this.isInitialized = true;
    }

    /**
     * Load and render a template file
     * @param templateName Name of the HTML template file
     * @param data Data object containing values to replace in template
     * @param options Handlebars compile options
     * @returns Rendered HTML string
     */
    static async renderFile(templateName: string, data: TemplateData, options?: CompileOptions): Promise<string> {
        this.initialize();

        try {
            const templatePath = `${templatesDir}/${templateName}.html`;
            const template = await fs.readFile(templatePath, "utf-8");
            const rendered = this.render(template, data, options);

            // Optionally save output for debugging
            // await fs.writeFile(`${templatesDir}/output_${templateName}.html`, rendered);

            return rendered;
        } catch (error) {
            throw new Error(`Error loading template file: ${error}`);
        }
    }

    /**
     * Render a template string with provided data
     * @param template Template string with Handlebars syntax
     * @param data Data object containing values to replace in template
     * @param options Handlebars compile options
     * @returns Rendered string
     */
    static render(template: string, data: TemplateData, options?: CompileOptions): string {
        this.initialize();

        const compiledTemplate = Handlebars.compile(template, options);
        return compiledTemplate(data);
    }

    /**
     * Register a custom helper
     * @param name Helper name
     * @param fn Helper function
     */
    static registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
        Handlebars.registerHelper(name, fn);
    }

    /**
     * Register a partial template
     * @param name Partial name
     * @param template Partial template string
     */
    static registerPartial(name: string, template: string): void {
        Handlebars.registerPartial(name, template);
    }

    /**
     * Unregister a helper
     * @param name Helper name
     */
    static unregisterHelper(name: string): void {
        Handlebars.unregisterHelper(name);
    }

    /**
     * Unregister a partial
     * @param name Partial name
     */
    static unregisterPartial(name: string): void {
        Handlebars.unregisterPartial(name);
    }
}

/**
 * Convenience function to render a template file
 * @param templatePath Path to the HTML template file
 * @param data Data object containing values to replace in template
 * @returns Rendered HTML string
 */
export async function renderHandlebarsTemplate(templatePath: string, data: TemplateData): Promise<string> {
    return HandlebarsTemplateEngine.renderFile(templatePath, data);
}

/**
 * Convenience function to render a template string
 * @param template Template string with Handlebars syntax
 * @param data Data object containing values to replace in template
 * @returns Rendered string
 */
export function renderHandlebarsString(template: string, data: TemplateData): string {
    return HandlebarsTemplateEngine.render(template, data);
}

/**
 * Format number as currency
 */
export function formatCurrency(amount: number, currency: string = "DA", locale: string = "fr-DZ"): string {
    if (amount === undefined || amount === null || isNaN(amount))
        return new Intl.NumberFormat(locale, { style: "currency", currency: "DZD" }).format(0);
    return new Intl.NumberFormat(locale, { style: "currency", currency: "DZD" }).format(amount);
}

/**
 * Convert number to French words (for invoices)
 */
function numberToWordsFr(n: number): string {
    const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

    if (n < 10) return units[n];
    if (n >= 10 && n < 20) return teens[n - 10];

    if (n >= 20 && n < 70) {
        const unit = n % 10;
        const ten = Math.floor(n / 10);
        if (unit === 0) return tens[ten];
        if (unit === 1 && ten !== 8) return tens[ten] + " et un";
        return tens[ten] + "-" + units[unit];
    }

    if (n >= 70 && n < 80) {
        const remainder = n - 60;
        if (remainder < 10) return "soixante-" + units[remainder];
        if (remainder >= 10 && remainder < 20) return "soixante-" + teens[remainder - 10];
    }

    if (n >= 80 && n < 100) {
        const remainder = n - 80;
        if (remainder === 0) return "quatre-vingts";
        if (remainder < 10) return "quatre-vingt-" + units[remainder];
        if (remainder >= 10 && remainder < 20) return "quatre-vingt-" + teens[remainder - 10];
    }

    if (n >= 100 && n < 1000) {
        const hundreds = Math.floor(n / 100);
        const remainder = n % 100;
        let result = hundreds === 1 ? "cent" : units[hundreds] + " cent";
        if (remainder === 0 && hundreds > 1) result += "s";
        if (remainder > 0) result += " " + numberToWordsFr(remainder);
        return result;
    }

    if (n >= 1000 && n < 1000000) {
        const thousands = Math.floor(n / 1000);
        const remainder = n % 1000;
        let result = thousands === 1 ? "mille" : numberToWordsFr(thousands) + " mille";
        if (remainder > 0) result += " " + numberToWordsFr(remainder);
        return result;
    }

    if (n >= 1000000) {
        const millions = Math.floor(n / 1000000);
        const remainder = n % 1000000;
        let result = numberToWordsFr(millions) + " million";
        if (millions > 1) result += "s";
        if (remainder > 0) result += " " + numberToWordsFr(remainder);
        return result;
    }

    return n.toString();
}

// Type for Handlebars compile options
interface CompileOptions {
    data?: boolean;
    compat?: boolean;
    knownHelpers?: { [name: string]: boolean };
    knownHelpersOnly?: boolean;
    noEscape?: boolean;
    strict?: boolean;
    assumeObjects?: boolean;
    preventIndent?: boolean;
    ignoreStandalone?: boolean;
    explicitPartialContext?: boolean;
}
