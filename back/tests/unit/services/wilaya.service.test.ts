import { wilayaFindAll, wilayaFindById, wilayaCreate, CreateWilayaInput } from "../../../src/features/wilaya/repository";
import * as wilayaService from "../../../src/features/wilaya/service";

jest.mock("../../../src/repositories/wilaya.repository");

describe("WilayaService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("findAllWilayas", () => {
        it("should return all wilayas", async () => {
            const mockWilayas = [
                {
                    code: "16",
                    name: "Alger",
                    isActive: true,
                },
            ] as any;

            (wilayaFindAll as jest.Mock).mockResolvedValue(mockWilayas);

            const result = await wilayaService.findAllWilayas({});
            expect(result).toEqual(mockWilayas);
        });
    });

    describe("findWilayaByCode", () => {
        it("should return a wilaya by code", async () => {
            const mockWilaya = {
                code: "16",
                name: "Alger",
                isActive: true,
            } as any;

            (wilayaFindById as jest.Mock).mockResolvedValue(mockWilaya);

            const result = await wilayaService.findWilayaByCode("16");
            expect(result).toEqual(mockWilaya);
        });

        it("should throw error if wilaya not found", async () => {
            (wilayaFindById as jest.Mock).mockRejectedValue(new Error("Wilaya not found"));

            await expect(wilayaService.findWilayaByCode("99")).rejects.toThrow("Wilaya not found");
        });
    });

    describe("createWilaya", () => {
        it("should create a new wilaya", async () => {
            const createData: CreateWilayaInput = {
                code: "16",
                name: "Alger",
                createdBy: "user1",
            };

            const mockWilaya = {
                ...createData,
                isActive: true,
            } as any;

            (wilayaCreate as jest.Mock).mockResolvedValue(mockWilaya);

            const result = await wilayaService.createWilaya(createData);
            expect(result).toEqual(mockWilaya);
        });

        it("should throw error if code already exists", async () => {
            const createData: CreateWilayaInput = {
                code: "16",
                name: "Alger",
                createdBy: "user1",
            };

            (wilayaCreate as jest.Mock).mockRejectedValue(new Error("Wilaya with this code already exists"));

            await expect(wilayaService.createWilaya(createData)).rejects.toThrow("Wilaya with this code already exists");
        });
    });
});
