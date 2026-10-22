import { antenneFindAll, antenneFindById, antenneCreate, CreateAntenneInput } from "../../../src/features/antenne/repository";
import * as antenneService from "../../../src/features/antenne/service";

jest.mock("../../../src/repositories/antenne.repository");

describe("AntenneService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("findAllAntennes", () => {
        it("should return all antennes", async () => {
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

            (antenneFindAll as jest.Mock).mockResolvedValue(mockAntennes);

            const result = await antenneService.findAllAntennes({});
            expect(result).toEqual(mockAntennes);
        });
    });

    describe("findAntenneById", () => {
        it("should return an antenne by id", async () => {
            const mockAntenne = {
                _id: "1",
                code: "AC01",
                label: "Antenne Centre 01",
                type: "AC",
                drId: "dr1",
                wilayaCode: "16",
                isActive: true,
            } as any;

            (antenneFindById as jest.Mock).mockResolvedValue(mockAntenne);

            const result = await antenneService.findAntenneById("1");
            expect(result).toEqual(mockAntenne);
        });

        it("should throw error if antenne not found", async () => {
            (antenneFindById as jest.Mock).mockRejectedValue(new Error("Antenne not found"));

            await expect(antenneService.findAntenneById("999")).rejects.toThrow("Antenne not found");
        });
    });

    describe("createAntenne", () => {
        it("should create a new antenne", async () => {
            const createData: CreateAntenneInput = {
                code: "AC02",
                label: "Antenne Centre 02",
                type: "AC",
                drId: "dr1",
                wilayaCode: "16",
                createdBy: "user1",
            };

            const mockAntenne = {
                _id: "2",
                ...createData,
                isActive: true,
            } as any;

            (antenneCreate as jest.Mock).mockResolvedValue(mockAntenne);

            const result = await antenneService.createAntenne(createData);
            expect(result).toEqual(mockAntenne);
        });

        it("should throw error if code already exists", async () => {
            const createData: CreateAntenneInput = {
                code: "AC01",
                label: "Antenne Centre 01",
                type: "AC",
                drId: "dr1",
                wilayaCode: "16",
                createdBy: "user1",
            };

            (antenneCreate as jest.Mock).mockRejectedValue(new Error("Antenne with this code already exists"));

            await expect(antenneService.createAntenne(createData)).rejects.toThrow("Antenne with this code already exists");
        });
    });
});
