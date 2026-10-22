import { Request, Response, NextFunction } from "express";
import * as drController from "../../../src/features/dr/controller";
import * as drService from "../../../src/features/dr/service";

jest.mock("../../../src/services/dr.service");

describe("DrController", () => {
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

    describe("getDrs", () => {
        it("should return 200 and all DRs", async () => {
            const mockDrs = [
                {
                    _id: "1",
                    code: "DRC",
                    name: "Direction Régionale du Centre",
                    isActive: true,
                },
            ] as any;

            (drService.findAllDrs as jest.Mock).mockResolvedValue(mockDrs);

            await drController.getDrs(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockDrs,
                message: "DRs retrieved successfully",
            });
        });

        it("should call next with error if service fails", async () => {
            const error = new Error("Database error");
            (drService.findAllDrs as jest.Mock).mockRejectedValue(error);

            await drController.getDrs(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getDrById", () => {
        it("should return 200 and the DR", async () => {
            const mockDr = {
                _id: "1",
                code: "DRC",
                name: "Direction Régionale du Centre",
                isActive: true,
            } as any;

            req.params = { id: "1" };
            (drService.findDrById as jest.Mock).mockResolvedValue(mockDr);

            await drController.getDrById(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockDr,
                message: "DR retrieved successfully",
            });
        });

        it("should return 400 if id not provided", async () => {
            req.params = {};

            await drController.getDrById(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "DR ID is required" });
        });
    });

    describe("createDr", () => {
        it("should return 201 and created DR", async () => {
            const mockDr = {
                _id: "2",
                code: "DRG",
                name: "Direction Régionale de l'Ouest",
                isActive: true,
            } as any;

            req.body = {
                code: "DRG",
                name: "Direction Régionale de l'Ouest",
            };

            (drService.createDr as jest.Mock).mockResolvedValue(mockDr);

            await drController.createDr(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                data: mockDr,
                message: "DR created successfully",
            });
        });

        it("should return 400 if required fields are missing", async () => {
            req.body = { code: "DRG" };

            await drController.createDr(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Missing required fields: code, name",
            });
        });
    });

    describe("updateDr", () => {
        it("should return 200 and updated DR", async () => {
            const mockDr = {
                _id: "1",
                code: "DRC",
                name: "Updated Name",
                isActive: true,
            } as any;

            req.params = { id: "1" };
            req.body = { name: "Updated Name" };

            (drService.updateDr as jest.Mock).mockResolvedValue(mockDr);

            await drController.updateDr(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockDr,
                message: "DR updated successfully",
            });
        });

        it("should return 400 if id not provided", async () => {
            req.params = {};

            await drController.updateDr(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "DR ID is required" });
        });
    });

    describe("deleteDr", () => {
        it("should return 200 and deleted DR", async () => {
            const mockDr = {
                _id: "1",
                code: "DRC",
                name: "Direction Régionale du Centre",
                isActive: false,
            } as any;

            req.params = { id: "1" };

            (drService.deleteDr as jest.Mock).mockResolvedValue(mockDr);

            await drController.deleteDr(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockDr,
                message: "DR deleted successfully",
            });
        });

        it("should return 400 if id not provided", async () => {
            req.params = {};

            await drController.deleteDr(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "DR ID is required" });
        });
    });
});
