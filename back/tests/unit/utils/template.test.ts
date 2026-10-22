import { TemplateEngine, renderTemplateString } from "../../src/utils/template";

describe("TemplateEngine", () => {
    describe("Simple Variable Interpolation", () => {
        it("should replace simple variables", () => {
            const template = "Hello, {{name}}!";
            const data = { name: "World" };
            const result = renderTemplateString(template, data);
            expect(result).toBe("Hello, World!");
        });

        it("should replace multiple variables", () => {
            const template = "{{greeting}}, {{name}}! You are {{age}} years old.";
            const data = { greeting: "Hello", name: "John", age: 30 };
            const result = renderTemplateString(template, data);
            expect(result).toBe("Hello, John! You are 30 years old.");
        });

        it("should handle missing variables", () => {
            const template = "Hello, {{name}}! {{missing}}";
            const data = { name: "World" };
            const result = renderTemplateString(template, data);
            expect(result).toBe("Hello, World! ");
        });
    });

    describe("Nested Object Access", () => {
        it("should access nested properties", () => {
            const template = "{{project.name}} - {{project.client.name}}";
            const data = {
                project: {
                    name: "Website",
                    client: {
                        name: "ACME Corp",
                    },
                },
            };
            const result = renderTemplateString(template, data);
            expect(result).toBe("Website - ACME Corp");
        });

        it("should handle deep nesting", () => {
            const template = "{{a.b.c.d.e}}";
            const data = {
                a: {
                    b: {
                        c: {
                            d: {
                                e: "Deep Value",
                            },
                        },
                    },
                },
            };
            const result = renderTemplateString(template, data);
            expect(result).toBe("Deep Value");
        });

        it("should handle missing nested properties", () => {
            const template = "{{project.missing.property}}";
            const data = { project: { name: "Test" } };
            const result = renderTemplateString(template, data);
            expect(result).toBe("");
        });
    });

    describe("Loops", () => {
        it("should loop over primitive arrays", () => {
            const template = "{{#each items}}{{this}},{{/each}}";
            const data = { items: ["a", "b", "c"] };
            const result = renderTemplateString(template, data);
            expect(result).toBe("a,b,c,");
        });

        it("should loop over object arrays", () => {
            const template = "{{#each users}}{{this.name}},{{/each}}";
            const data = {
                users: [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }],
            };
            const result = renderTemplateString(template, data);
            expect(result).toBe("Alice,Bob,Charlie,");
        });

        it("should access loop index", () => {
            const template = "{{#each items}}{{@index}}:{{this}},{{/each}}";
            const data = { items: ["a", "b", "c"] };
            const result = renderTemplateString(template, data);
            expect(result).toBe("0:a,1:b,2:c,");
        });

        it("should access nested properties in loops", () => {
            const template = "{{#each employees}}{{this.firstName}} {{this.lastName}},{{/each}}";
            const data = {
                employees: [
                    { firstName: "John", lastName: "Doe" },
                    { firstName: "Jane", lastName: "Smith" },
                ],
            };
            const result = renderTemplateString(template, data);
            expect(result).toBe("John Doe,Jane Smith,");
        });

        it("should handle empty arrays", () => {
            const template = "Items: {{#each items}}{{this}}{{/each}}";
            const data = { items: [] };
            const result = renderTemplateString(template, data);
            expect(result).toBe("Items: ");
        });

        it("should handle non-existent arrays", () => {
            const template = "{{#each missing}}{{this}}{{/each}}";
            const data = { other: "value" };
            const result = renderTemplateString(template, data);
            expect(result).toBe("");
        });
    });

    describe("Conditionals", () => {
        it("should show content when condition is truthy", () => {
            const template = "{{#if show}}Content{{/if}}";
            const data = { show: true };
            const result = renderTemplateString(template, data);
            expect(result).toBe("Content");
        });

        it("should hide content when condition is falsy", () => {
            const template = "{{#if show}}Content{{/if}}";
            const data = { show: false };
            const result = renderTemplateString(template, data);
            expect(result).toBe("");
        });

        it("should handle non-empty arrays as truthy", () => {
            const template = "{{#if items}}Has items{{/if}}";
            const data = { items: ["a", "b"] };
            const result = renderTemplateString(template, data);
            expect(result).toBe("Has items");
        });

        it("should handle empty arrays as falsy", () => {
            const template = "{{#if items}}Has items{{/if}}";
            const data = { items: [] };
            const result = renderTemplateString(template, data);
            expect(result).toBe("");
        });

        it("should handle nested conditionals", () => {
            const template = "{{#if user.isAdmin}}Admin{{/if}}";
            const data = { user: { isAdmin: true } };
            const result = renderTemplateString(template, data);
            expect(result).toBe("Admin");
        });
    });

    describe("Complex Templates", () => {
        it("should handle combination of features", () => {
            const template = `
Project: {{project.name}}
{{#if employees}}
Team:
{{#each employees}}
- {{this.name}} ({{this.role}})
{{/each}}
{{/if}}
Status: {{project.status}}`;

            const data = {
                project: {
                    name: "Website Redesign",
                    status: "In Progress",
                },
                employees: [
                    { name: "Alice", role: "Designer" },
                    { name: "Bob", role: "Developer" },
                ],
            };

            const result = renderTemplateString(template, data);
            expect(result).toContain("Project: Website Redesign");
            expect(result).toContain("Team:");
            expect(result).toContain("- Alice (Designer)");
            expect(result).toContain("- Bob (Developer)");
            expect(result).toContain("Status: In Progress");
        });

        it("should handle HTML template with multiple loops", () => {
            const template = `
<h1>{{title}}</h1>
<ul>
{{#each items}}
  <li>{{this.name}}: {{this.price}}</li>
{{/each}}
</ul>
<div>
{{#each tags}}
  <span>{{this}}</span>
{{/each}}
</div>`;

            const data = {
                title: "Products",
                items: [
                    { name: "Item 1", price: 100 },
                    { name: "Item 2", price: 200 },
                ],
                tags: ["new", "sale", "featured"],
            };

            const result = renderTemplateString(template, data);
            expect(result).toContain("<h1>Products</h1>");
            expect(result).toContain("<li>Item 1: 100</li>");
            expect(result).toContain("<li>Item 2: 200</li>");
            expect(result).toContain("<span>new</span>");
            expect(result).toContain("<span>sale</span>");
            expect(result).toContain("<span>featured</span>");
        });
    });
});
