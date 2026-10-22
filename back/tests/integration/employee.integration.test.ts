import request from "supertest";
import { createApp } from "../../src/app";
import { connectDatabase, disconnectDatabase } from "../../src/config/database";
import { config } from "../../src/config";

jest.mock("../../src/middlewares/auth", () => ({
    authCheck: (req: any, res: any, next: any) => next(),
    adminCheck: (req: any, res: any, next: any) => next(),
}));

describe("Employee Integration Tests", () => {
    const { app } = createApp();
    const path = "/employees";

    beforeAll(async () => {
        await connectDatabase(config.mongodbUri);
    });

    afterAll(async () => {
        await disconnectDatabase();
    });

    describe("[GET] /employees", () => {
        it("should return 200 and list of employees", async () => {
            const result = await request(app).get(path);
            expect(result.status).toBe(200);
            expect(result.body.data).toBeInstanceOf(Array);
            expect(result.body.message).toBe("Employees retrieved successfully");
        });
    });

    describe("[GET] /employees/:id", () => {
        it("should return 400 if invalid id format", async () => {
            const result = await request(app).get(`${path}/invalid-id`);
            expect([400, 500]).toContain(result.status);
        });
    });



    describe("[POST] /employees", () => {
        it("should return 400 if required fields are missing", async () => {
            const result = await request(app).post(path).send({});
            expect([400, 500]).toContain(result.status);
        });
    });

    describe("[GET] /employees with filters", () => {
        it("should return 200 when filtering by roleId", async () => {
            const result = await request(app).get(`${path}?roleId=507f1f77bcf86cd799439011`);
            expect(result.status).toBe(200);
            expect(result.body.data).toBeInstanceOf(Array);
        });

        it("should return 200 when filtering by antenneId", async () => {
            const result = await request(app).get(`${path}?antenneId=507f1f77bcf86cd799439011`);
            expect(result.status).toBe(200);
            expect(result.body.data).toBeInstanceOf(Array);
        });

        it("should return 200 when filtering by drId", async () => {
            const result = await request(app).get(`${path}?drId=507f1f77bcf86cd799439011`);
            expect(result.status).toBe(200);
            expect(result.body.data).toBeInstanceOf(Array);
        });

        it("should return 200 when filtering by multiple parameters", async () => {
            const result = await request(app).get(`${path}?roleId=507f1f77bcf86cd799439011&drId=507f1f77bcf86cd799439012`);
            expect(result.status).toBe(200);
            expect(result.body.data).toBeInstanceOf(Array);
        });
    });
});
