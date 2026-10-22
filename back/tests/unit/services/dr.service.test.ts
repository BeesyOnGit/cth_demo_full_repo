import { drFindAll, drFindById, drCreate, CreateDrInput } from "../../../src/features/dr/repository";
import * as drService from "../../../src/features/dr/service";

jest.mock("../../../src/repositories/dr.repository");

describe("DrService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("findAllDrs", () => {
        it("should return all DRs", async () => {
            const mockDrs = [
                {
                    _id: "1",
                    code: "DRC",
                    name: "Direction Régionale du Centre",
                    isActive: true,
                },
            ] as any;

            (drFindAll as jest.Mock).mockResolvedValue(mockDrs);

            const result = await drService.findAllDrs({});
            expect(result).toEqual(mockDrs);
        });
    });

    describe("findDrById", () => {
        it("should return a DR by id", async () => {
            const mockDr = {
                _id: "1",
                code: "DRC",
                name: "Direction Régionale du Centre",
                isActive: true,
            } as any;

            (drFindById as jest.Mock).mockResolvedValue(mockDr);

            const result = await drService.findDrById("1");
            expect(result).toEqual(mockDr);
        });

        it("should throw error if DR not found", async () => {
            (drFindById as jest.Mock).mockRejectedValue(new Error("DR not found"));

            await expect(drService.findDrById("999")).rejects.toThrow("DR not found");
        });
    });

    describe("createDr", () => {
        it("should create a new DR", async () => {
            const createData: CreateDrInput = {
                code: "DRG",
                name: "Direction Régionale de l'Ouest",
                createdBy: "user1",
            };

            const mockDr = {
                _id: "2",
                ...createData,
                isActive: true,
            } as any;

            (drCreate as jest.Mock).mockResolvedValue(mockDr);

            const result = await drService.createDr(createData);
            expect(result).toEqual(mockDr);
        });

        it("should throw error if code already exists", async () => {
            const createData: CreateDrInput = {
                code: "DRC",
                name: "Direction Régionale du Centre",
                createdBy: "user1",
            };

            (drCreate as jest.Mock).mockRejectedValue(new Error("DR with this code already exists"));

            await expect(drService.createDr(createData)).rejects.toThrow("DR with this code already exists");
        });
    });
});
