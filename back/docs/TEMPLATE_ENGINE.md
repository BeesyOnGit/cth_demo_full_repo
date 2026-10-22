# Template Engine Documentation

A lightweight and powerful templating system for rendering HTML files with dynamic data.

## Features

- ✅ **Variable Interpolation**: Simple `{{variable}}` syntax
- ✅ **Nested Object Access**: Access deep properties with `{{object.property.nested}}`
- ✅ **Loops**: Iterate over arrays with `{{#each array}}...{{/each}}`
- ✅ **Loop Index**: Access current index with `{{@index}}`
- ✅ **Conditionals**: Show/hide content with `{{#if condition}}...{{/if}}`
- ✅ **Type-Safe**: Written in TypeScript with full type support

## Installation

The template engine is already included in your project at `src/utils/template.ts`.

## Basic Usage

### 1. Simple Variable Interpolation

```typescript
import { renderTemplateString } from "./utils/template";

const template = "Hello, {{name}}!";
const data = { name: "World" };
const result = renderTemplateString(template, data);
// Output: "Hello, World!"
```

### 2. Nested Object Access

```typescript
const template = "Project: {{project.name}}, Client: {{project.client.name}}";
const data = {
    project: {
        name: "Website Redesign",
        client: {
            name: "ACME Corp",
        },
    },
};
const result = renderTemplateString(template, data);
// Output: "Project: Website Redesign, Client: ACME Corp"
```

### 3. Rendering from HTML Files

```typescript
import { renderTemplate } from "./utils/template";
import path from "path";

const templatePath = path.join(__dirname, "templates/invoice.html");
const data = {
    invoice: {
        number: "INV-001",
        date: "2025-01-15",
        amount: 5000,
    },
    client: {
        name: "Company XYZ",
    },
};

const html = await renderTemplate(templatePath, data);
// Returns fully rendered HTML string
```

## Template Syntax

### Variables

Use double curly braces to insert variables:

```html
<h1>{{title}}</h1>
<p>{{description}}</p>
```

Access nested properties with dot notation:

```html
<h1>{{project.name}}</h1>
<p>Client: {{project.client.name}}</p>
<p>Location: {{project.location.city}}, {{project.location.country}}</p>
```

### Loops

Iterate over arrays using `{{#each}}` blocks:

#### Loop over Primitive Arrays

```html
<ul>
    {{#each tags}}
    <li>{{this}}</li>
    {{/each}}
</ul>
```

Data:

```typescript
{
    tags: ["JavaScript", "TypeScript", "Node.js"];
}
```

#### Loop over Object Arrays

```html
<table>
    {{#each employees}}
    <tr>
        <td>{{this.firstName}}</td>
        <td>{{this.lastName}}</td>
        <td>{{this.email}}</td>
    </tr>
    {{/each}}
</table>
```

Data:

```typescript
{
    employees: [
        { firstName: "John", lastName: "Doe", email: "john@example.com" },
        { firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
    ];
}
```

#### Loop with Index

Access the current iteration index with `{{@index}}`:

```html
<ol>
    {{#each items}}
    <li>Item {{@index}}: {{this.name}}</li>
    {{/each}}
</ol>
```

### Conditionals

Show or hide content based on conditions:

```html
{{#if user.isAdmin}}
<button>Admin Panel</button>
{{/if}} {{#if items}}
<p>You have items in your cart</p>
{{/if}}
```

Conditionals are truthy if:

- Boolean values that are `true`
- Non-empty arrays
- Non-null/undefined values

## Complete Example

### Template File: `templates/project-report.html`

```html
<!DOCTYPE html>
<html>
    <head>
        <title>{{project.name}} - Report</title>
    </head>
    <body>
        <h1>{{project.name}}</h1>

        <div class="info">
            <p><strong>Client:</strong> {{client.name}}</p>
            <p><strong>Status:</strong> {{project.status}}</p>
            <p><strong>Budget:</strong> {{project.budget}} DZD</p>
        </div>

        {{#if employees}}
        <h2>Team Members</h2>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Role</th>
                </tr>
            </thead>
            <tbody>
                {{#each employees}}
                <tr>
                    <td>{{@index}}</td>
                    <td>{{this.firstName}} {{this.lastName}}</td>
                    <td>{{this.role}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
        {{/if}} {{#if invoices}}
        <h2>Invoices</h2>
        <ul>
            {{#each invoices}}
            <li>{{this.number}} - {{this.amount}} DZD ({{this.status}})</li>
            {{/each}}
        </ul>
        {{/if}}
    </body>
</html>
```

### Usage in Your Code

```typescript
import { renderTemplate } from "./utils/template";
import path from "path";
import fs from "fs/promises";

async function generateProjectReport(projectId: string) {
    // Fetch your data from database
    const projectData = {
        project: {
            name: "Fiber Optic Installation",
            status: "In Progress",
            budget: 5000000,
        },
        client: {
            name: "Telecom Algeria",
        },
        employees: [
            { firstName: "Ahmed", lastName: "Benali", role: "Project Manager" },
            { firstName: "Fatima", lastName: "Mansouri", role: "Engineer" },
        ],
        invoices: [
            { number: "INV-001", amount: 2000000, status: "Paid" },
            { number: "INV-002", amount: 1500000, status: "Pending" },
        ],
    };

    // Render the template
    const templatePath = path.join(__dirname, "templates/project-report.html");
    const html = await renderTemplate(templatePath, projectData);

    // Save or send the rendered HTML
    await fs.writeFile(`reports/project-${projectId}.html`, html);

    return html;
}
```

## API Reference

### `renderTemplate(templatePath: string, data: object): Promise<string>`

Loads and renders a template file.

**Parameters:**

- `templatePath`: Absolute path to the HTML template file
- `data`: Object containing the data to render

**Returns:** Promise that resolves to the rendered HTML string

### `renderTemplateString(template: string, data: object): string`

Renders a template string directly.

**Parameters:**

- `template`: Template string with template syntax
- `data`: Object containing the data to render

**Returns:** Rendered string

### `TemplateEngine.render(template: string, data: object): string`

Static method to render a template string (same as `renderTemplateString`).

## Best Practices

1. **Keep templates simple**: Complex logic should be in your code, not templates
2. **Prepare data before rendering**: Format dates, calculate totals, etc. before passing to template
3. **Use meaningful variable names**: `{{project.client.name}}` is better than `{{p.c.n}}`
4. **Test your templates**: Write tests for complex template logic
5. **Cache templates**: For production, consider caching loaded template files

## Example Use Cases

- **Invoice Generation**: Create PDF-ready HTML invoices
- **Email Templates**: Render personalized email content
- **Reports**: Generate project reports, financial statements
- **Documentation**: Auto-generate documentation from code
- **Certificates**: Create customized certificates or documents

## Running Examples

Run the included examples:

```bash
npm run dev
# Then execute:
npx ts-node src/examples/template-examples.ts
```

## Testing

Run the test suite:

```bash
npm test -- template
```

## Limitations

- No else blocks for conditionals (use separate `{{#if}}` blocks)
- No custom helpers or filters
- No complex expressions in templates (keep logic in code)

## Future Enhancements

Potential additions:

- `{{#unless}}` for negative conditionals
- `{{else}}` blocks
- Custom helper functions
- Template partials/includes
- Expression evaluation
