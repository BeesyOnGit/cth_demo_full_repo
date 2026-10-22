import * as drRepository from "../../../src/features/dr/repository";
import { DrModel } from "../../../src/features/dr/model";
import { Types } from "mongoose";

jest.mock("../../../src/models/dr.model");

describe("DrRepository", () => {
    const mockObjectId = new Types.ObjectId();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("drFindAll", () => {
        it("should return all active DRs", async () => {
            const mockDrs = [
                {
                    _id: mockObjectId,
                    code: "DRC",
                    name: "Direction Régionale du Centre",
                    isActive: true,
                },
            ];

            (DrModel.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockDrs),
            });

            const result = await drRepository.drFindAll({});

            expect(DrModel.find).toHaveBeenCalledWith({ isActive: true });
            expect(result).toEqual(mockDrs);
        });
    });

    describe("drFindById", () => {
        it("should throw error if id is not provided", async () => {
            await expect(drRepository.drFindById("")).rejects.toThrow("DR ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            await expect(drRepository.drFindById("invalid-id")).rejects.toThrow("Invalid DR ID");
        });

        it("should return DR if found", async () => {
            const mockDr = {
                _id: mockObjectId,
                code: "DRC",
                name: "Direction Régionale du Centre",
                isActive: true,
            };

            (DrModel.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockDr),
            });

            const result = await drRepository.drFindById(mockObjectId.toString());

            expect(DrModel.findById).toHaveBeenCalledWith(mockObjectId.toString());
            expect(result).toEqual(mockDr);
        });

        it("should throw error if DR not found", async () => {
            (DrModel.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(drRepository.drFindById(mockObjectId.toString())).rejects.toThrow("DR not found");
        });
    });

    describe("drCreate", () => {
        it("should throw error if code is not provided", async () => {
            const data = {
                code: "" as any,
                name: "Direction Régionale du Centre",
                createdBy: mockObjectId.toString(),
            };

            await expect(drRepository.drCreate(data)).rejects.toThrow("Code is required");
        });

        it("should throw error if name is not provided", async () => {
            const data = {
                code: "DRC" as const,
                name: "",
                createdBy: mockObjectId.toString(),
            };

            await expect(drRepository.drCreate(data)).rejects.toThrow("Name is required");
        });

        it("should throw error if createdBy is not provided", async () => {
            const data = {
                code: "DRC" as const,
                name: "Direction Régionale du Centre",
                createdBy: "",
            };

            await expect(drRepository.drCreate(data)).rejects.toThrow("Created by user ID is required");
        });

        it("should throw error if code already exists", async () => {
            const data = {
                code: "DRC" as const,
                name: "Direction Régionale du Centre",
                createdBy: mockObjectId.toString(),
            };

            (DrModel.findOne as jest.Mock).mockResolvedValue({ code: "DRC" });

            await expect(drRepository.drCreate(data)).rejects.toThrow("DR with this code already exists");
        });

        it("should create DR successfully", async () => {
            const data = {
                code: "DRC" as const,
                name: "Direction Régionale du Centre",
                createdBy: mockObjectId.toString(),
            };

            const mockDr = {
                _id: mockObjectId,
                ...data,
                save: jest.fn().mockResolvedValue(true),
                populate: jest.fn().mockResolvedValue({
                    _id: mockObjectId,
                    ...data,
                }),
            };

            (DrModel.findOne as jest.Mock).mockResolvedValue(null);
            (DrModel as any).mockImplementation(() => mockDr);

            const result = await drRepository.drCreate(data);

            expect(mockDr.save).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });

    describe("drUpdate", () => {
        it("should throw error if id is not provided", async () => {
            const data = {
                id: "",
                name: "Updated Name",
                updatedBy: mockObjectId.toString(),
            };

            await expect(drRepository.drUpdate(data)).rejects.toThrow("DR ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            const data = {
                id: "invalid-id",
                name: "Updated Name",
                updatedBy: mockObjectId.toString(),
            };

            await expect(drRepository.drUpdate(data)).rejects.toThrow("Invalid DR ID");
        });

        it("should throw error if updatedBy is not provided", async () => {
            const data = {
                id: mockObjectId.toString(),
                name: "Updated Name",
                updatedBy: "",
            };

            await expect(drRepository.drUpdate(data)).rejects.toThrow("Updated by user ID is required");
        });

        it("should throw error if DR not found", async () => {
            const data = {
                id: mockObjectId.toString(),
                name: "Updated Name",
                updatedBy: mockObjectId.toString(),
            };

            (DrModel.findById as jest.Mock).mockResolvedValue(null);

            await expect(drRepository.drUpdate(data)).rejects.toThrow("DR not found");
        });

        it("should update DR successfully", async () => {
            const data = {
                id: mockObjectId.toString(),
                name: "Updated Name",
                updatedBy: mockObjectId.toString(),
            };

            const mockDr = {
                _id: mockObjectId,
                code: "DRC",
                name: "Updated Name",
            };

            (DrModel.findById as jest.Mock).mockResolvedValue(mockDr);
            (DrModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockDr),
            });

            const result = await drRepository.drUpdate(data);

            expect(DrModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(result).toEqual(mockDr);
        });
    });

    describe("drDelete", () => {
        it("should throw error if id is not provided", async () => {
            await expect(drRepository.drDelete("", mockObjectId.toString())).rejects.toThrow("DR ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            await expect(drRepository.drDelete("invalid-id", mockObjectId.toString())).rejects.toThrow("Invalid DR ID");
        });

        it("should throw error if deletedBy is not provided", async () => {
            await expect(drRepository.drDelete(mockObjectId.toString(), "")).rejects.toThrow("Deleted by user ID is required");
        });

        it("should delete (deactivate) DR successfully", async () => {
            const mockDr = {
                _id: mockObjectId,
                code: "DRC",
                name: "Direction Régionale du Centre",
                isActive: false,
            };

            (DrModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockDr),
            });

            const result = await drRepository.drDelete(mockObjectId.toString(), mockObjectId.toString());

            expect(DrModel.findByIdAndUpdate).toHaveBeenCalledWith(
                mockObjectId.toString(),
                expect.objectContaining({
                    isActive: false,
                }),
                { new: true }
            );
            expect(result).toEqual(mockDr);
        });

        it("should throw error if DR not found", async () => {
            (DrModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(drRepository.drDelete(mockObjectId.toString(), mockObjectId.toString())).rejects.toThrow("DR not found");
        });
    });
});
