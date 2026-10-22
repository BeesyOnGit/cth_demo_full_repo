import { Request, Response, NextFunction } from "express";
import * as wilayaController from "../../../src/features/wilaya/controller";
import * as wilayaService from "../../../src/features/wilaya/service";

jest.mock("../../../src/services/wilaya.service");

describe("WilayaController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
            body: {},
            headers: {
                userid: "1",
            },
        } as any;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe("getWilayas", () => {
        it("should return 200 and all wilayas", async () => {
            const mockWilayas = [
                {
                    code: "16",
                    name: "Alger",
                    isActive: true,
                },
            ] as any;

            (wilayaService.findAllWilayas as jest.Mock).mockResolvedValue(mockWilayas);

            await wilayaController.getWilayas(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockWilayas,
                message: "Wilayas retrieved successfully",
            });
        });

        it("should call next with error if service fails", async () => {
            const error = new Error("Database error");
            (wilayaService.findAllWilayas as jest.Mock).mockRejectedValue(error);

            await wilayaController.getWilayas(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getWilayaByCode", () => {
        it("should return 200 and the wilaya", async () => {
            const mockWilaya = {
                code: "16",
                name: "Alger",
                isActive: true,
            } as any;

            req.params = { code: "16" };
            (wilayaService.findWilayaByCode as jest.Mock).mockResolvedValue(mockWilaya);

            await wilayaController.getWilayaByCode(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockWilaya,
                message: "Wilaya retrieved successfully",
            });
        });

        it("should return 400 if code not provided", async () => {
            req.params = {};

            await wilayaController.getWilayaByCode(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Wilaya code is required" });
        });
    });

    describe("createWilaya", () => {
        it("should return 201 and created wilaya", async () => {
            const mockWilaya = {
                code: "16",
                name: "Alger",
                isActive: true,
            } as any;

            req.body = {
                code: "16",
                name: "Alger",
            };

            (wilayaService.createWilaya as jest.Mock).mockResolvedValue(mockWilaya);

            await wilayaController.createWilaya(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                data: mockWilaya,
                message: "Wilaya created successfully",
            });
        });

        it("should return 400 if required fields are missing", async () => {
            req.body = { code: "16" };

            await wilayaController.createWilaya(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Missing required fields: code, name",
            });
        });
    });

    describe("updateWilaya", () => {
        it("should return 200 and updated wilaya", async () => {
            const mockWilaya = {
                code: "16",
                name: "Updated Name",
                isActive: true,
            } as any;

            req.params = { code: "16" };
            req.body = { name: "Updated Name" };

            (wilayaService.updateWilaya as jest.Mock).mockResolvedValue(mockWilaya);

            await wilayaController.updateWilaya(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockWilaya,
                message: "Wilaya updated successfully",
            });
        });

        it("should return 400 if code not provided", async () => {
            req.params = {};

            await wilayaController.updateWilaya(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Wilaya code is required" });
        });
    });

    describe("deleteWilaya", () => {
        it("should return 200 and deleted wilaya", async () => {
            const mockWilaya = {
                code: "16",
                name: "Alger",
                isActive: false,
            } as any;

            req.params = { code: "16" };

            (wilayaService.deleteWilaya as jest.Mock).mockResolvedValue(mockWilaya);

            await wilayaController.deleteWilaya(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockWilaya,
                message: "Wilaya deleted successfully",
            });
        });

        it("should return 400 if code not provided", async () => {
            req.params = {};

            await wilayaController.deleteWilaya(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Wilaya code is required" });
        });
    });
});
