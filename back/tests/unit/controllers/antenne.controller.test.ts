import { Request, Response, NextFunction } from "express";
import * as antenneController from "../../../src/features/antenne/controller";
import * as antenneService from "../../../src/features/antenne/service";

jest.mock("../../../src/services/antenne.service");

describe("AntenneController", () => {
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

    describe("getAntennes", () => {
        it("should return 200 and all antennes", async () => {
            const mockAntennes = [
                {
                    _id: "1",
                    code: "AC01",
                    label: "Antenne Centre 01",
                    type: "AC",
                    drId: "dr1",
                    wilayaCode: "16",
                    isActive: true,
                },
            ] as any;

            (antenneService.findAllAntennes as jest.Mock).mockResolvedValue(mockAntennes);

            await antenneController.getAntennes(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockAntennes,
                message: "Antennes retrieved successfully",
            });
        });

        it("should call next with error if service fails", async () => {
            const error = new Error("Database error");
            (antenneService.findAllAntennes as jest.Mock).mockRejectedValue(error);

            await antenneController.getAntennes(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getAntenneById", () => {
        it("should return 200 and the antenne", async () => {
            const mockAntenne = {
                _id: "1",
                code: "AC01",
                label: "Antenne Centre 01",
                type: "AC",
                drId: "dr1",
                wilayaCode: "16",
                isActive: true,
            } as any;

            req.params = { id: "1" };
            (antenneService.findAntenneById as jest.Mock).mockResolvedValue(mockAntenne);

            await antenneController.getAntenneById(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockAntenne,
                message: "Antenne retrieved successfully",
            });
        });

        it("should return 400 if id not provided", async () => {
            req.params = {};

            await antenneController.getAntenneById(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Antenne ID is required" });
        });
    });

    describe("createAntenne", () => {
        it("should return 201 and created antenne", async () => {
            const mockAntenne = {
                _id: "2",
                code: "AC02",
                label: "Antenne Centre 02",
                type: "AC",
                drId: "dr1",
                wilayaCode: "16",
                isActive: true,
            } as any;

            req.body = {
                code: "AC02",
                label: "Antenne Centre 02",
                type: "AC",
                drId: "dr1",
                wilayaCode: "16",
            };

            (antenneService.createAntenne as jest.Mock).mockResolvedValue(mockAntenne);

            await antenneController.createAntenne(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                data: mockAntenne,
                message: "Antenne created successfully",
            });
        });

        it("should return 400 if required fields are missing", async () => {
            req.body = { code: "AC02" };

            await antenneController.createAntenne(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Missing required fields: code, label, type, drId, wilayaCode",
            });
        });
    });

    describe("updateAntenne", () => {
        it("should return 200 and updated antenne", async () => {
            const mockAntenne = {
                _id: "1",
                code: "AC01",
                label: "Updated Label",
                type: "AC",
                drId: "dr1",
                wilayaCode: "16",
                isActive: true,
            } as any;

            req.params = { id: "1" };
            req.body = { label: "Updated Label" };

            (antenneService.updateAntenne as jest.Mock).mockResolvedValue(mockAntenne);

            await antenneController.updateAntenne(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockAntenne,
                message: "Antenne updated successfully",
            });
        });

        it("should return 400 if id not provided", async () => {
            req.params = {};

            await antenneController.updateAntenne(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Antenne ID is required" });
        });
    });

    describe("deleteAntenne", () => {
        it("should return 200 and deleted antenne", async () => {
            const mockAntenne = {
                _id: "1",
                code: "AC01",
                label: "Antenne Centre 01",
                type: "AC",
                drId: "dr1",
                wilayaCode: "16",
                isActive: false,
            } as any;

            req.params = { id: "1" };

            (antenneService.deleteAntenne as jest.Mock).mockResolvedValue(mockAntenne);

            await antenneController.deleteAntenne(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockAntenne,
                message: "Antenne deleted successfully",
            });
        });

        it("should return 400 if id not provided", async () => {
            req.params = {};

            await antenneController.deleteAntenne(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Antenne ID is required" });
        });
    });
});
