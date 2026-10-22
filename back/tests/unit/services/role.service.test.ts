import { roleFindAll, roleFindById, roleCreate, CreateRoleInput } from "../../../src/features/role/repository";
import * as roleService from "../../../src/features/role/service";

jest.mock("../../../src/repositories/role.repository");

describe("RoleService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("findAllRoles", () => {
        it("should return all roles", async () => {
            const mockRoles = [
                {
                    _id: "1",
                    code: "ADMIN",
                    label: "Administrator",
                    isActive: true,
                },
            ] as any;

            (roleFindAll as jest.Mock).mockResolvedValue(mockRoles);

            const result = await roleService.findAllRoles({});
            expect(result).toEqual(mockRoles);
        });
    });

    describe("findRoleById", () => {
        it("should return a role by id", async () => {
            const mockRole = {
                _id: "1",
                code: "ADMIN",
                label: "Administrator",
                isActive: true,
            } as any;

            (roleFindById as jest.Mock).mockResolvedValue(mockRole);

            const result = await roleService.findRoleById("1");
            expect(result).toEqual(mockRole);
        });

        it("should throw error if role not found", async () => {
            (roleFindById as jest.Mock).mockRejectedValue(new Error("Role not found"));

            await expect(roleService.findRoleById("999")).rejects.toThrow("Role not found");
        });
    });

    describe("createRole", () => {
        it("should create a new role", async () => {
            const createData: CreateRoleInput = {
                code: "MANAGER",
                label: "Manager",
                permissions: ["read", "write"],
                createdBy: "user1",
            };

            const mockRole = {
                _id: "2",
                ...createData,
                isActive: true,
            } as any;

            (roleCreate as jest.Mock).mockResolvedValue(mockRole);

            const result = await roleService.createRole(createData);
            expect(result).toEqual(mockRole);
        });

        it("should throw error if code already exists", async () => {
            const createData: CreateRoleInput = {
                code: "ADMIN",
                label: "Administrator",
                createdBy: "user1",
            };

            (roleCreate as jest.Mock).mockRejectedValue(new Error("Role with this code already exists"));

            await expect(roleService.createRole(createData)).rejects.toThrow("Role with this code already exists");
        });
    });
});
