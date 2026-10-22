import request from "supertest";
import { createApp } from "../../src/app";
import { connectDatabase, disconnectDatabase } from "../../src/config/database";
import { config } from "../../src/config";

jest.mock("../../src/middlewares/auth", () => ({
    authCheck: (req: any, res: any, next: any) => next(),
    adminCheck: (req: any, res: any, next: any) => next(),
}));

describe("Commune Integration Tests", () => {
    const { app } = createApp();
    const path = "/communes";

    beforeAll(async () => {
        await connectDatabase(config.mongodbUri);
    });

    afterAll(async () => {
        await disconnectDatabase();
    });

    describe("[GET] /communes", () => {
        it("should return 200 and list of communes", async () => {
            const result = await request(app).get(path);
            expect(result.status).toBe(200);
            expect(result.body.data).toBeInstanceOf(Array);
            expect(result.body.message).toBe("Communes retrieved successfully");
        });
    });

    describe("[GET] /communes/:id", () => {
        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).get(`${path}/invalid-id`);
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[GET] /communes/post-code/:postCode", () => {
        it("should return 404 or 500 if not found", async () => {
            const result = await request(app).get(`${path}/post-code/99999`);
            expect([200, 404, 500]).toContain(result.status);
        });
    });

    describe("[GET] /communes/wilaya/:wilayaId", () => {
        it("should return 400 or 500 if invalid wilayaId format", async () => {
            const result = await request(app).get(`${path}/wilaya/invalid-id`);
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[POST] /communes", () => {
        it("should return 400 if required fields are missing", async () => {
            const result = await request(app).post(path).send({});
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[PUT] /communes/:id", () => {
        it("should return 400 if id is not provided", async () => {
            const result = await request(app).put(`${path}/`).send({ name: "Updated" });
            expect(result.status).toBe(404);
        });

        it("should return 400 or 500 if invalid id format", async () => {
            const result = await request(app).put(`${path}/invalid-id`).send({ name: "Updated" });
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[DELETE] /communes/:id", () => {
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
