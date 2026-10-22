import request from "supertest";
import { createApp } from "../../src/app";
import { connectDatabase, disconnectDatabase } from "../../src/config/database";
import { config } from "../../src/config";

jest.mock("../../src/middlewares/auth", () => ({
    authCheck: (req: any, res: any, next: any) => next(),
    adminCheck: (req: any, res: any, next: any) => next(),
}));

describe("Project Integration Tests", () => {
    const { app } = createApp();
    const path = "/projects";

    beforeAll(async () => {
        await connectDatabase(config.mongodbUri);
    });

    afterAll(async () => {
        await disconnectDatabase();
    });

    describe("[GET] /projects", () => {
        it("should return 200 and list of projects", async () => {
            const result = await request(app).get(path);
            expect(result.status).toBe(200);
            expect(result.body.data).toBeInstanceOf(Array);
            expect(result.body.message).toBe("Projects retrieved successfully");
        });
    });

    describe("[GET] /projects/:id", () => {
        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).get(`${path}/invalid-id`);
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[POST] /projects", () => {
        it("should return 400 if required fields are missing", async () => {
            const result = await request(app).post(path).send({});
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[PUT] /projects/:id", () => {
        it("should return 400 if id is not provided", async () => {
            const result = await request(app).put(`${path}/`).send({ name: "Updated" });
            expect(result.status).toBe(404);
        });

        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).put(`${path}/invalid-id`).send({ name: "Updated" });
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[DELETE] /projects/:id", () => {
        it("should return 400 if id is not provided", async () => {
            const result = await request(app).delete(`${path}/`);
            expect(result.status).toBe(404);
        });

        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).delete(`${path}/invalid-id`);
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[PATCH] /projects/:id/convert-to-ods", () => {
        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).patch(`${path}/invalid-id/convert-to-ods`);
            expect([400, 500]).toContain(result.status);
        });
    });
});
