import * as antenneRepository from "../../../src/features/antenne/repository";
import { AntenneModel } from "../../../src/features/antenne/model";
import { Types } from "mongoose";

jest.mock("../../../src/models/antenne.model");

describe("AntenneRepository", () => {
    const mockObjectId = new Types.ObjectId();
    const mockDrId = new Types.ObjectId();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("antenneFindAll", () => {
        it("should return all active antennes", async () => {
            const mockAntennes = [
                {
                    _id: mockObjectId,
                    code: "AC01",
                    label: "Antenne Centre 01",
                    type: "AC",
                    drId: mockDrId,
                    wilayaCode: "16",
                    isActive: true,
                },
            ];

            (AntenneModel.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockAntennes),
            });

            const result = await antenneRepository.antenneFindAll({});

            expect(AntenneModel.find).toHaveBeenCalledWith({ isActive: true });
            expect(result).toEqual(mockAntennes);
        });
    });

    describe("antenneFindById", () => {
        it("should throw error if id is not provided", async () => {
            await expect(antenneRepository.antenneFindById("")).rejects.toThrow("Antenne ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            await expect(antenneRepository.antenneFindById("invalid-id")).rejects.toThrow("Invalid Antenne ID");
        });

        it("should return antenne if found", async () => {
            const mockAntenne = {
                _id: mockObjectId,
                code: "AC01",
                label: "Antenne Centre 01",
                type: "AC",
                drId: mockDrId,
                wilayaCode: "16",
                isActive: true,
            };

            (AntenneModel.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockAntenne),
            });

            const result = await antenneRepository.antenneFindById(mockObjectId.toString());

            expect(AntenneModel.findById).toHaveBeenCalledWith(mockObjectId.toString());
            expect(result).toEqual(mockAntenne);
        });

        it("should throw error if antenne not found", async () => {
            (AntenneModel.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(antenneRepository.antenneFindById(mockObjectId.toString())).rejects.toThrow("Antenne not found");
        });
    });

    describe("antenneCreate", () => {
        it("should throw error if code is not provided", async () => {
            const data = {
                code: "",
                label: "Antenne Centre 01",
                type: "AC" as const,
                drId: mockDrId.toString(),
                wilayaCode: "16",
                createdBy: mockObjectId.toString(),
            };

            await expect(antenneRepository.antenneCreate(data)).rejects.toThrow("Code is required");
        });

        it("should throw error if label is not provided", async () => {
            const data = {
                code: "AC01",
                label: "",
                type: "AC" as const,
                drId: mockDrId.toString(),
                wilayaCode: "16",
                createdBy: mockObjectId.toString(),
            };

            await expect(antenneRepository.antenneCreate(data)).rejects.toThrow("Label is required");
        });

        it("should throw error if type is not provided", async () => {
            const data = {
                code: "AC01",
                label: "Antenne Centre 01",
                type: "" as any,
                drId: mockDrId.toString(),
                wilayaCode: "16",
                createdBy: mockObjectId.toString(),
            };

            await expect(antenneRepository.antenneCreate(data)).rejects.toThrow("Type is required");
        });

        it("should throw error if drId is not provided", async () => {
            const data = {
                code: "AC01",
                label: "Antenne Centre 01",
                type: "AC" as const,
                drId: "",
                wilayaCode: "16",
                createdBy: mockObjectId.toString(),
            };

            await expect(antenneRepository.antenneCreate(data)).rejects.toThrow("DR ID is required");
        });

        it("should throw error if wilayaCode is not provided", async () => {
            const data = {
                code: "AC01",
                label: "Antenne Centre 01",
                type: "AC" as const,
                drId: mockDrId.toString(),
                wilayaCode: "",
                createdBy: mockObjectId.toString(),
            };

            await expect(antenneRepository.antenneCreate(data)).rejects.toThrow("Wilaya code is required");
        });

        it("should throw error if createdBy is not provided", async () => {
            const data = {
                code: "AC01",
                label: "Antenne Centre 01",
                type: "AC" as const,
                drId: mockDrId.toString(),
                wilayaCode: "16",
                createdBy: "",
            };

            await expect(antenneRepository.antenneCreate(data)).rejects.toThrow("Created by user ID is required");
        });

        it("should throw error if code already exists", async () => {
            const data = {
                code: "AC01",
                label: "Antenne Centre 01",
                type: "AC" as const,
                drId: mockDrId.toString(),
                wilayaCode: "16",
                createdBy: mockObjectId.toString(),
            };

            (AntenneModel.findOne as jest.Mock).mockResolvedValue({ code: "AC01" });

            await expect(antenneRepository.antenneCreate(data)).rejects.toThrow("Antenne with this code already exists");
        });

        it("should create antenne successfully", async () => {
            const data = {
                code: "AC01",
                label: "Antenne Centre 01",
                type: "AC" as const,
                drId: mockDrId.toString(),
                wilayaCode: "16",
                createdBy: mockObjectId.toString(),
            };

            const mockAntenne = {
                _id: mockObjectId,
                ...data,
                save: jest.fn().mockResolvedValue(true),
                populate: jest.fn().mockResolvedValue({
                    _id: mockObjectId,
                    ...data,
                }),
            };

            (AntenneModel.findOne as jest.Mock).mockResolvedValue(null);
            (AntenneModel as any).mockImplementation(() => mockAntenne);

            const result = await antenneRepository.antenneCreate(data);

            expect(mockAntenne.save).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });

    describe("antenneUpdate", () => {
        it("should throw error if id is not provided", async () => {
            const data = {
                id: "",
                label: "Updated Label",
                updatedBy: mockObjectId.toString(),
            };

            await expect(antenneRepository.antenneUpdate(data)).rejects.toThrow("Antenne ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            const data = {
                id: "invalid-id",
                label: "Updated Label",
                updatedBy: mockObjectId.toString(),
            };

            await expect(antenneRepository.antenneUpdate(data)).rejects.toThrow("Invalid Antenne ID");
        });

        it("should throw error if updatedBy is not provided", async () => {
            const data = {
                id: mockObjectId.toString(),
                label: "Updated Label",
                updatedBy: "",
            };

            await expect(antenneRepository.antenneUpdate(data)).rejects.toThrow("Updated by user ID is required");
        });

        it("should throw error if antenne not found", async () => {
            const data = {
                id: mockObjectId.toString(),
                label: "Updated Label",
                updatedBy: mockObjectId.toString(),
            };

            (AntenneModel.findById as jest.Mock).mockResolvedValue(null);

            await expect(antenneRepository.antenneUpdate(data)).rejects.toThrow("Antenne not found");
        });

        it("should update antenne successfully", async () => {
            const data = {
                id: mockObjectId.toString(),
                label: "Updated Label",
                updatedBy: mockObjectId.toString(),
            };

            const mockAntenne = {
                _id: mockObjectId,
                code: "AC01",
                label: "Updated Label",
                type: "AC",
                drId: mockDrId,
                wilayaCode: "16",
            };

            (AntenneModel.findById as jest.Mock).mockResolvedValue(mockAntenne);
            (AntenneModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockAntenne),
            });

            const result = await antenneRepository.antenneUpdate(data);

            expect(AntenneModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(result).toEqual(mockAntenne);
        });
    });

    describe("antenneDelete", () => {
        it("should throw error if id is not provided", async () => {
            await expect(antenneRepository.antenneDelete("", mockObjectId.toString())).rejects.toThrow("Antenne ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            await expect(antenneRepository.antenneDelete("invalid-id", mockObjectId.toString())).rejects.toThrow("Invalid Antenne ID");
        });

        it("should throw error if deletedBy is not provided", async () => {
            await expect(antenneRepository.antenneDelete(mockObjectId.toString(), "")).rejects.toThrow("Deleted by user ID is required");
        });

        it("should delete (deactivate) antenne successfully", async () => {
            const mockAntenne = {
                _id: mockObjectId,
                code: "AC01",
                label: "Antenne Centre 01",
                type: "AC",
                drId: mockDrId,
                wilayaCode: "16",
                isActive: false,
            };

            (AntenneModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockAntenne),
            });

            const result = await antenneRepository.antenneDelete(mockObjectId.toString(), mockObjectId.toString());

            expect(AntenneModel.findByIdAndUpdate).toHaveBeenCalledWith(
                mockObjectId.toString(),
                expect.objectContaining({
                    isActive: false,
                }),
                { new: true }
            );
            expect(result).toEqual(mockAntenne);
        });

        it("should throw error if antenne not found", async () => {
            (AntenneModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(antenneRepository.antenneDelete(mockObjectId.toString(), mockObjectId.toString())).rejects.toThrow("Antenne not found");
        });
    });
});
