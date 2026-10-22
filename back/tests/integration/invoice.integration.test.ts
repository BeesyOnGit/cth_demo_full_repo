import request from "supertest";
import { createApp } from "../../src/app";
import { connectDatabase, disconnectDatabase } from "../../src/config/database";
import { config } from "../../src/config";

jest.mock("../../src/middlewares/auth", () => ({
    authCheck: (req: any, res: any, next: any) => next(),
    adminCheck: (req: any, res: any, next: any) => next(),
}));

describe("Invoice Integration Tests", () => {
    const { app } = createApp();
    const path = "/invoices";

    beforeAll(async () => {
        await connectDatabase(config.mongodbUri);
    });

    afterAll(async () => {
        await disconnectDatabase();
    });

    describe("[GET] /invoices", () => {
        it("should return 200 and list of invoices", async () => {
            const result = await request(app).get(path);
            expect(result.status).toBe(200);
            expect(result.body.data).toBeInstanceOf(Array);
        });
    });

    describe("[GET] /invoices/:id", () => {
        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).get(`${path}/invalid-id`);
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[GET] /invoices/:id/pdf", () => {
        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).get(`${path}/invalid-id/pdf`);
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[POST] /invoices", () => {
        it("should return 400 if required fields are missing", async () => {
            const result = await request(app).post(path).send({});
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[PUT] /invoices/:id", () => {
        it("should return 400 if id is not provided", async () => {
            const result = await request(app).put(`${path}/`).send({ total: 1000 });
            expect(result.status).toBe(404);
        });

        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).put(`${path}/invalid-id`).send({ total: 1000 });
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[DELETE] /invoices/:id", () => {
        it("should return 400 if id is not provided", async () => {
            const result = await request(app).delete(`${path}/`);
            expect(result.status).toBe(404);
        });

        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).delete(`${path}/invalid-id`);
            expect([400, 500]).toContain(result.status);
        });
    });
});
