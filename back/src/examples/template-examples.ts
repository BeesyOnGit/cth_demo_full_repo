import { renderTemplate, renderTemplateString, TemplateEngine } from "../utils/template";
import path from "path";

/**
 * Example usage of the template engine
 */
async function exampleUsage() {
    console.log("=== Template Engine Examples ===\n");

    // Example 1: Simple variable interpolation
    console.log("1. Simple Variable Interpolation:");
    const simpleTemplate = "Hello, {{name}}! Your age is {{age}}.";
    const simpleData = { name: "John", age: 30 };
    console.log(renderTemplateString(simpleTemplate, simpleData));
    console.log("");

    // Example 2: Nested object access
    console.log("2. Nested Object Access:");
    const nestedTemplate = "Project: {{project.name}}, Client: {{project.client.name}}";
    const nestedData = {
        project: {
            name: "Website Redesign",
            client: {
                name: "ACME Corp",
            },
        },
    };
    console.log(renderTemplateString(nestedTemplate, nestedData));
    console.log("");

    // Example 3: Loop with primitive values
    console.log("3. Loop with Primitive Values:");
    const loopTemplate = "Tags: {{#each tags}}<span>{{this}}</span> {{/each}}";
    const loopData = {
        tags: ["JavaScript", "TypeScript", "Node.js"],
    };
    console.log(renderTemplateString(loopTemplate, loopData));
    console.log("");

    // Example 4: Loop with objects
    console.log("4. Loop with Objects:");
    const objectLoopTemplate = `
Users:
{{#each users}}
- {{this.name}} ({{this.email}})
{{/each}}`;
    const objectLoopData = {
        users: [
            { name: "Alice", email: "alice@example.com" },
            { name: "Bob", email: "bob@example.com" },
            { name: "Charlie", email: "charlie@example.com" },
        ],
    };
    console.log(renderTemplateString(objectLoopTemplate, objectLoopData));
    console.log("");

    // Example 5: Loop with index
    console.log("5. Loop with Index:");
    const indexLoopTemplate = `
{{#each items}}
Item {{@index}}: {{this.name}}
{{/each}}`;
    const indexLoopData = {
        items: [{ name: "First" }, { name: "Second" }, { name: "Third" }],
    };
    console.log(renderTemplateString(indexLoopTemplate, indexLoopData));
    console.log("");

    // Example 6: Conditionals
    console.log("6. Conditionals:");
    const conditionalTemplate = `
{{#if hasAccess}}
Welcome! You have access.
{{/if}}
{{#if premium}}
Premium features enabled.
{{/if}}`;
    const conditionalData = {
        hasAccess: true,
        premium: false,
    };
    console.log(renderTemplateString(conditionalTemplate, conditionalData));
    console.log("");

    // Example 7: Complex template with file
    console.log("7. Full HTML Template from File:");
    try {
        const templatePath = path.join(__dirname, "../templates/example.html");
        const fullData = {
            project: {
                name: "Fiber Optic Network Installation",
                description: "Installation of fiber optic cables for high-speed internet",
                wilaya: "Algiers",
                startDate: "2025-01-15",
                budget: 5000000,
                status: "In Progress",
            },
            client: {
                name: "Telecom Algeria",
            },
            employees: [
                {
                    firstName: "Ahmed",
                    lastName: "Benali",
                    role: "Project Manager",
                    email: "ahmed.benali@example.com",
                },
                {
                    firstName: "Fatima",
                    lastName: "Mansouri",
                    role: "Network Engineer",
                    email: "fatima.mansouri@example.com",
                },
                {
                    firstName: "Karim",
                    lastName: "Cherif",
                    role: "Technician",
                    email: "karim.cherif@example.com",
                },
            ],
            invoices: [
                {
                    number: "INV-2025-001",
                    date: "2025-01-20",
                    amount: 1500000,
                    status: "Paid",
                },
                {
                    number: "INV-2025-002",
                    date: "2025-02-15",
                    amount: 2000000,
                    status: "Pending",
                },
            ],
            employeeCount: 3,
            invoiceCount: 2,
        };

        const rendered = await renderTemplate(templatePath, fullData);
        console.log("Template rendered successfully! Length:", rendered.length, "characters");
        console.log("First 200 characters:");
        console.log(rendered.substring(0, 200) + "...");
    } catch (error) {
        console.error("Error rendering template:", error);
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    exampleUsage().catch(console.error);
}

export { exampleUsage };
