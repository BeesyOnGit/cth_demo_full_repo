import * as wilayaRepository from "../../../src/features/wilaya/repository";
import { WilayaModel } from "../../../src/features/wilaya/model";
import { Types } from "mongoose";

jest.mock("../../../src/models/wilaya.model");

describe("WilayaRepository", () => {
    const mockObjectId = new Types.ObjectId();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("wilayaFindAll", () => {
        it("should return all active wilayas", async () => {
            const mockWilayas = [
                {
                    code: "16",
                    name: "Alger",
                    isActive: true,
                },
            ];

            (WilayaModel.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockWilayas),
            });

            const result = await wilayaRepository.wilayaFindAll({});

            expect(WilayaModel.find).toHaveBeenCalledWith({ isActive: true });
            expect(result).toEqual(mockWilayas);
        });
    });

    describe("wilayaFindById", () => {
        it("should throw error if code is not provided", async () => {
            await expect(wilayaRepository.wilayaFindById("")).rejects.toThrow("Wilaya code is required");
        });

        it("should return wilaya if found", async () => {
            const mockWilaya = {
                code: "16",
                name: "Alger",
                isActive: true,
            };

            (WilayaModel.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockWilaya),
            });

            const result = await wilayaRepository.wilayaFindById("16");

            expect(WilayaModel.findOne).toHaveBeenCalledWith({ code: "16", isActive: true });
            expect(result).toEqual(mockWilaya);
        });

        it("should throw error if wilaya not found", async () => {
            (WilayaModel.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(wilayaRepository.wilayaFindById("99")).rejects.toThrow("Wilaya not found");
        });
    });

    describe("wilayaCreate", () => {
        it("should throw error if code is not provided", async () => {
            const data = {
                code: "",
                name: "Alger",
                createdBy: mockObjectId.toString(),
            };

            await expect(wilayaRepository.wilayaCreate(data)).rejects.toThrow("Code is required");
        });

        it("should throw error if name is not provided", async () => {
            const data = {
                code: "16",
                name: "",
                createdBy: mockObjectId.toString(),
            };

            await expect(wilayaRepository.wilayaCreate(data)).rejects.toThrow("Name is required");
        });

        it("should throw error if createdBy is not provided", async () => {
            const data = {
                code: "16",
                name: "Alger",
                createdBy: "",
            };

            await expect(wilayaRepository.wilayaCreate(data)).rejects.toThrow("Created by user ID is required");
        });

        it("should throw error if code already exists", async () => {
            const data = {
                code: "16",
                name: "Alger",
                createdBy: mockObjectId.toString(),
            };

            (WilayaModel.findOne as jest.Mock).mockResolvedValue({ code: "16" });

            await expect(wilayaRepository.wilayaCreate(data)).rejects.toThrow("Wilaya with this code already exists");
        });

        it("should create wilaya successfully", async () => {
            const data = {
                code: "16",
                name: "Alger",
                createdBy: mockObjectId.toString(),
            };

            const mockWilaya = {
                ...data,
                save: jest.fn().mockResolvedValue(true),
                populate: jest.fn().mockResolvedValue({
                    ...data,
                }),
            };

            (WilayaModel.findOne as jest.Mock).mockResolvedValue(null);
            (WilayaModel as any).mockImplementation(() => mockWilaya);

            const result = await wilayaRepository.wilayaCreate(data);

            expect(mockWilaya.save).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });

    describe("wilayaUpdate", () => {
        it("should throw error if code is not provided", async () => {
            const data = {
                code: "",
                name: "Updated Name",
                updatedBy: mockObjectId.toString(),
            };

            await expect(wilayaRepository.wilayaUpdate(data)).rejects.toThrow("Wilaya code is required");
        });

        it("should throw error if updatedBy is not provided", async () => {
            const data = {
                code: "16",
                name: "Updated Name",
                updatedBy: "",
            };

            await expect(wilayaRepository.wilayaUpdate(data)).rejects.toThrow("Updated by user ID is required");
        });

        it("should throw error if wilaya not found", async () => {
            const data = {
                code: "99",
                name: "Updated Name",
                updatedBy: mockObjectId.toString(),
            };

            (WilayaModel.findOne as jest.Mock).mockResolvedValue(null);

            await expect(wilayaRepository.wilayaUpdate(data)).rejects.toThrow("Wilaya not found");
        });

        it("should update wilaya successfully", async () => {
            const data = {
                code: "16",
                name: "Updated Name",
                updatedBy: mockObjectId.toString(),
            };

            const mockWilaya = {
                code: "16",
                name: "Updated Name",
            };

            (WilayaModel.findOne as jest.Mock).mockResolvedValue(mockWilaya);
            (WilayaModel.findOneAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockWilaya),
            });

            const result = await wilayaRepository.wilayaUpdate(data);

            expect(WilayaModel.findOneAndUpdate).toHaveBeenCalled();
            expect(result).toEqual(mockWilaya);
        });
    });

    describe("wilayaDelete", () => {
        it("should throw error if code is not provided", async () => {
            await expect(wilayaRepository.wilayaDelete("", mockObjectId.toString())).rejects.toThrow("Wilaya code is required");
        });

        it("should throw error if deletedBy is not provided", async () => {
            await expect(wilayaRepository.wilayaDelete("16", "")).rejects.toThrow("Deleted by user ID is required");
        });

        it("should delete (deactivate) wilaya successfully", async () => {
            const mockWilaya = {
                code: "16",
                name: "Alger",
                isActive: false,
            };

            (WilayaModel.findOneAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockWilaya),
            });

            const result = await wilayaRepository.wilayaDelete("16", mockObjectId.toString());

            expect(WilayaModel.findOneAndUpdate).toHaveBeenCalledWith(
                { code: "16" },
                expect.objectContaining({
                    isActive: false,
                }),
                { new: true }
            );
            expect(result).toEqual(mockWilaya);
        });

        it("should throw error if wilaya not found", async () => {
            (WilayaModel.findOneAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(wilayaRepository.wilayaDelete("99", mockObjectId.toString())).rejects.toThrow("Wilaya not found");
        });
    });
});
