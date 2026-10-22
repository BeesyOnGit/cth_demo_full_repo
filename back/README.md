# SOLID Node.js TypeScript Boilerplate

This is a ready-to-go boilerplate for a Node.js project using TypeScript, following SOLID principles and Functional Programming.

## Features

- **TypeScript**: Typed superset of JavaScript.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **Functional Programming**: Uses pure functions, guard clauses, and avoids classes.
- **SOLID Principles**: Applied to functional design.
- **Security**:
    - `helmet`: Secure Express apps by setting various HTTP headers.
    - `cors`: Enable Cross-Origin Resource Sharing.
- **Logging**:
    - `winston`: Universal logging library.
    - `morgan`: HTTP request logger middleware.
- **Validation**: `zod` for schema validation.
- **Testing**: `jest` and `supertest` for unit and integration testing.
- **Linting & Formatting**: `eslint` and `prettier`.

## Project Structure

```
src/
├── config/         # Environment variables and configuration
├── controllers/    # Route controllers (Request/Response handling)
├── interfaces/     # TypeScript interfaces and DTOs
├── middlewares/    # Express middlewares (Error handling, etc.)
├── models/         # Database models (Repositories)
├── routes/         # Route definitions
├── services/       # Business logic
├── utils/          # Utility classes/functions (Logger, etc.)
├── app.ts          # App setup
└── server.ts       # Entry point
tests/              # Test files
```

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn

### Installation

1. Clone the repository.
2. Install dependencies:
    ```bash
    npm install
    ```

### Running the App

- **Development**:
    ```bash
    npm run dev
    ```
- **Production**:
    ```bash
    npm run build
    npm start
    ```

### Testing

Run tests using Jest:

```bash
npm test
```

### Linting & Formatting

- Lint: `npm run lint`
- Format: `npm run format`
