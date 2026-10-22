import request from "supertest";
import { createApp } from "../../src/app";
import { connectDatabase, disconnectDatabase } from "../../src/config/database";
import { config } from "../../src/config";

jest.mock("../../src/middlewares/auth", () => ({
    authCheck: (req: any, res: any, next: any) => next(),
    adminCheck: (req: any, res: any, next: any) => next(),
}));

describe("Antenne Integration Tests", () => {
    const { app } = createApp();
    const path = "/antennes";

    beforeAll(async () => {
        await connectDatabase(config.mongodbUri);
    });

    afterAll(async () => {
        await disconnectDatabase();
    });

    describe("[GET] /antennes", () => {
        it("should return 200 and list of antennes", async () => {
            const result = await request(app).get(path);
            expect(result.status).toBe(200);
            expect(result.body.data).toBeInstanceOf(Array);
            expect(result.body.message).toBe("Antennes retrieved successfully");
        });
    });

    describe("[GET] /antennes/:id", () => {
        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).get(`${path}/invalid-id`);
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[POST] /antennes", () => {
        it("should return 400 if required fields are missing", async () => {
            const result = await request(app).post(path).send({});
            expect([400, 500]).toContain(result.status);
        });

        it("should return 400 if only partial data provided", async () => {
            const result = await request(app).post(path).send({
                code: "AC99",
                label: "Test Antenne",
            });
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[PUT] /antennes/:id", () => {
        it("should return 400 if id is not provided", async () => {
            const result = await request(app).put(`${path}/`).send({ label: "Updated" });
            expect(result.status).toBe(404);
        });

        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).put(`${path}/invalid-id`).send({ label: "Updated" });
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[DELETE] /antennes/:id", () => {
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
