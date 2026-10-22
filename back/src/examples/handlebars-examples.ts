import { renderHandlebarsTemplate, renderHandlebarsString, HandlebarsTemplateEngine } from "../utils/handlebars-template";

/**
 * Example usage of the Handlebars template engine
 */
async function handlebarsExamples() {
    console.log("=== Handlebars Template Engine Examples ===\n");

    // Example 1: Simple variable interpolation
    console.log("1. Simple Variable Interpolation:");
    const simpleTemplate = "Hello, {{name}}! Your age is {{age}}.";
    const simpleData = { name: "John", age: 30 };
    console.log(renderHandlebarsString(simpleTemplate, simpleData));
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
    console.log(renderHandlebarsString(nestedTemplate, nestedData));
    console.log("");

    // Example 3: Loop with primitive values
    console.log("3. Loop with Primitive Values:");
    const loopTemplate = "Tags: {{#each tags}}<span>{{this}}</span> {{/each}}";
    const loopData = {
        tags: ["JavaScript", "TypeScript", "Node.js"],
    };
    console.log(renderHandlebarsString(loopTemplate, loopData));
    console.log("");

    // Example 4: Loop with objects
    console.log("4. Loop with Objects:");
    const objectLoopTemplate = `Users:
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
    console.log(renderHandlebarsString(objectLoopTemplate, objectLoopData));
    console.log("");

    // Example 5: Loop with index
    console.log("5. Loop with Index:");
    const indexLoopTemplate = `{{#each items}}
Item {{@index}}: {{this.name}}
{{/each}}`;
    const indexLoopData = {
        items: [{ name: "First" }, { name: "Second" }, { name: "Third" }],
    };
    console.log(renderHandlebarsString(indexLoopTemplate, indexLoopData));
    console.log("");

    // Example 6: Conditionals
    console.log("6. Conditionals:");
    const conditionalTemplate = `{{#if hasAccess}}
Welcome! You have access.
{{/if}}
{{#if premium}}
Premium features enabled.
{{else}}
Standard features only.
{{/if}}`;
    const conditionalData = {
        hasAccess: true,
        premium: false,
    };
    console.log(renderHandlebarsString(conditionalTemplate, conditionalData));
    console.log("");

    // Example 7: Comparison helpers
    console.log("7. Comparison Helpers:");
    const comparisonTemplate = `Status: {{status}}
{{#if (eq status "active")}}
✓ System is active
{{else if (eq status "pending")}}
⏳ System is pending
{{else}}
✗ System is inactive
{{/if}}`;
    const comparisonData = { status: "active" };
    console.log(renderHandlebarsString(comparisonTemplate, comparisonData));
    console.log("");

    // Example 8: Custom helpers
    console.log("8. Custom Helpers:");
    const helperTemplate = `Amount: {{formatCurrency amount}}
Date: {{formatDate date}}
Uppercase: {{uppercase name}}
Default: {{default description "No description"}}`;
    const helperData = {
        amount: 150000,
        date: new Date("2025-01-15"),
        name: "john doe",
        description: null,
    };
    console.log(renderHandlebarsString(helperTemplate, helperData));
    console.log("");

    // Example 9: Nested loops
    console.log("9. Nested Loops:");
    const nestedLoopTemplate = `{{#each departments}}
Department: {{this.name}}
{{#each this.employees}}
  - {{this.name}} ({{this.role}})
{{/each}}
{{/each}}`;
    const nestedLoopData = {
        departments: [
            {
                name: "Engineering",
                employees: [
                    { name: "Alice", role: "Developer" },
                    { name: "Bob", role: "Architect" },
                ],
            },
            {
                name: "Sales",
                employees: [
                    { name: "Charlie", role: "Sales Rep" },
                    { name: "Diana", role: "Manager" },
                ],
            },
        ],
    };
    console.log(renderHandlebarsString(nestedLoopTemplate, nestedLoopData));
    console.log("");

    // Example 10: Unless helper
    console.log("10. Unless Helper:");
    const unlessTemplate = `{{#unless isLoggedIn}}
Please login to continue.
{{/unless}}
{{#unless hasErrors}}
All systems operational!
{{/unless}}`;
    const unlessData = {
        isLoggedIn: false,
        hasErrors: false,
    };
    console.log(renderHandlebarsString(unlessTemplate, unlessData));
    console.log("");

    // Example 11: Invoice template
    console.log("11. Invoice Template:");
    const invoiceTemplate = `
INVOICE #{{invoice.number}}
Date: {{formatDate invoice.date}}

Client: {{client.name}}
Address: {{client.address}}

Items:
{{#each invoice.items}}
{{@index}}. {{this.description}} - {{formatCurrency this.amount}}
{{/each}}

Total: {{formatCurrency invoice.total}}

{{#if invoice.paid}}
Status: ✓ PAID
{{else}}
Status: ⏳ PENDING
{{/if}}`;
    const invoiceData = {
        client: {
            name: "Tech Corp",
            address: "123 Main St, Algiers",
        },
        invoice: {
            number: "INV-2025-001",
            date: new Date("2025-01-15"),
            items: [
                { description: "Web Development", amount: 500000 },
                { description: "Hosting Setup", amount: 150000 },
                { description: "Maintenance (3 months)", amount: 300000 },
            ],
            total: 950000,
            paid: true,
        },
    };
    console.log(renderHandlebarsString(invoiceTemplate, invoiceData));
}

// Run examples if this file is executed directly
if (require.main === module) {
    handlebarsExamples().catch(console.error);
}

export { handlebarsExamples };
