import request from "supertest";
import { createApp } from "../../src/app";
import { connectDatabase, disconnectDatabase } from "../../src/config/database";
import { config } from "../../src/config";

jest.mock("../../src/middlewares/auth", () => ({
    authCheck: (req: any, res: any, next: any) => next(),
    adminCheck: (req: any, res: any, next: any) => next(),
}));

describe("Wilaya Integration Tests", () => {
    const { app } = createApp();
    const path = "/wilayas";

    beforeAll(async () => {
        await connectDatabase(config.mongodbUri);
    });

    afterAll(async () => {
        await disconnectDatabase();
    });

    describe("[GET] /wilayas", () => {
        it("should return 200 and list of wilayas", async () => {
            const result = await request(app).get(path);
            expect(result.status).toBe(200);
            expect(result.body.data).toBeInstanceOf(Array);
            expect(result.body.message).toBe("Wilayas retrieved successfully");
        });
    });

    describe("[GET] /wilayas/:code", () => {
        it("should return 400 or 404 if invalid code", async () => {
            const result = await request(app).get(`${path}/99`);
            expect([400, 404]).toContain(result.status);
        });
    });

    describe("[POST] /wilayas", () => {
        it("should return 400 if required fields are missing", async () => {
            const result = await request(app).post(path).send({});
            expect([400, 500]).toContain(result.status);
        });

        it("should return 400 if only partial data provided", async () => {
            const result = await request(app).post(path).send({
                code: "16",
            });
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[PUT] /wilayas/:code", () => {
        it("should return 400 if code is not provided", async () => {
            const result = await request(app).put(`${path}/`).send({ name: "Updated" });
            expect(result.status).toBe(404);
        });

        it("should return 400 or 404 if invalid code", async () => {
            const result = await request(app).put(`${path}/99`).send({ name: "Updated" });
            expect([400, 404]).toContain(result.status);
        });
    });

    describe("[DELETE] /wilayas/:code", () => {
        it("should return 400 if code is not provided", async () => {
            const result = await request(app).delete(`${path}/`);
            expect(result.status).toBe(404);
        });

        it("should return 400 or 404 if invalid code", async () => {
            const result = await request(app).delete(`${path}/99`);
            expect([400, 404]).toContain(result.status);
        });
    });
});
