import * as roleRepository from "../../../src/features/role/repository";
import { RoleModel } from "../../../src/features/role/model";
import { Types } from "mongoose";

jest.mock("../../../src/models/role.model");

describe("RoleRepository", () => {
    const mockObjectId = new Types.ObjectId();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("roleFindAll", () => {
        it("should return all active roles", async () => {
            const mockRoles = [
                {
                    _id: mockObjectId,
                    code: "ADMIN",
                    label: "Administrator",
                    isActive: true,
                },
            ];

            (RoleModel.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockRoles),
            });

            const result = await roleRepository.roleFindAll({});

            expect(RoleModel.find).toHaveBeenCalledWith({ isActive: true });
            expect(result).toEqual(mockRoles);
        });
    });

    describe("roleFindById", () => {
        it("should throw error if id is not provided", async () => {
            await expect(roleRepository.roleFindById("")).rejects.toThrow("Role ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            await expect(roleRepository.roleFindById("invalid-id")).rejects.toThrow("Invalid Role ID");
        });

        it("should return role if found", async () => {
            const mockRole = {
                _id: mockObjectId,
                code: "ADMIN",
                label: "Administrator",
                isActive: true,
            };

            (RoleModel.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockRole),
            });

            const result = await roleRepository.roleFindById(mockObjectId.toString());

            expect(RoleModel.findById).toHaveBeenCalledWith(mockObjectId.toString());
            expect(result).toEqual(mockRole);
        });

        it("should throw error if role not found", async () => {
            (RoleModel.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(roleRepository.roleFindById(mockObjectId.toString())).rejects.toThrow("Role not found");
        });
    });

    describe("roleCreate", () => {
        it("should throw error if code is not provided", async () => {
            const data = {
                code: "",
                label: "Administrator",
                createdBy: mockObjectId.toString(),
            };

            await expect(roleRepository.roleCreate(data)).rejects.toThrow("Code is required");
        });

        it("should throw error if label is not provided", async () => {
            const data = {
                code: "ADMIN",
                label: "",
                createdBy: mockObjectId.toString(),
            };

            await expect(roleRepository.roleCreate(data)).rejects.toThrow("Label is required");
        });

        it("should throw error if createdBy is not provided", async () => {
            const data = {
                code: "ADMIN",
                label: "Administrator",
                createdBy: "",
            };

            await expect(roleRepository.roleCreate(data)).rejects.toThrow("Created by user ID is required");
        });

        it("should throw error if code already exists", async () => {
            const data = {
                code: "ADMIN",
                label: "Administrator",
                createdBy: mockObjectId.toString(),
            };

            (RoleModel.findOne as jest.Mock).mockResolvedValue({ code: "ADMIN" });

            await expect(roleRepository.roleCreate(data)).rejects.toThrow("Role with this code already exists");
        });

        it("should create role successfully", async () => {
            const data = {
                code: "ADMIN",
                label: "Administrator",
                permissions: ["read", "write"],
                createdBy: mockObjectId.toString(),
            };

            const mockRole = {
                _id: mockObjectId,
                ...data,
                save: jest.fn().mockResolvedValue(true),
                populate: jest.fn().mockResolvedValue({
                    _id: mockObjectId,
                    ...data,
                }),
            };

            (RoleModel.findOne as jest.Mock).mockResolvedValue(null);
            (RoleModel as any).mockImplementation(() => mockRole);

            const result = await roleRepository.roleCreate(data);

            expect(mockRole.save).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });

    describe("roleUpdate", () => {
        it("should throw error if id is not provided", async () => {
            const data = {
                id: "",
                label: "Updated Label",
                updatedBy: mockObjectId.toString(),
            };

            await expect(roleRepository.roleUpdate(data)).rejects.toThrow("Role ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            const data = {
                id: "invalid-id",
                label: "Updated Label",
                updatedBy: mockObjectId.toString(),
            };

            await expect(roleRepository.roleUpdate(data)).rejects.toThrow("Invalid Role ID");
        });

        it("should throw error if updatedBy is not provided", async () => {
            const data = {
                id: mockObjectId.toString(),
                label: "Updated Label",
                updatedBy: "",
            };

            await expect(roleRepository.roleUpdate(data)).rejects.toThrow("Updated by user ID is required");
        });

        it("should throw error if role not found", async () => {
            const data = {
                id: mockObjectId.toString(),
                label: "Updated Label",
                updatedBy: mockObjectId.toString(),
            };

            (RoleModel.findById as jest.Mock).mockResolvedValue(null);

            await expect(roleRepository.roleUpdate(data)).rejects.toThrow("Role not found");
        });

        it("should update role successfully", async () => {
            const data = {
                id: mockObjectId.toString(),
                label: "Updated Label",
                permissions: ["read", "write", "delete"],
                updatedBy: mockObjectId.toString(),
            };

            const mockRole = {
                _id: mockObjectId,
                code: "ADMIN",
                label: "Updated Label",
                permissions: ["read", "write", "delete"],
            };

            (RoleModel.findById as jest.Mock).mockResolvedValue(mockRole);
            (RoleModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockRole),
            });

            const result = await roleRepository.roleUpdate(data);

            expect(RoleModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(result).toEqual(mockRole);
        });
    });

    describe("roleDelete", () => {
        it("should throw error if id is not provided", async () => {
            await expect(roleRepository.roleDelete("", mockObjectId.toString())).rejects.toThrow("Role ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            await expect(roleRepository.roleDelete("invalid-id", mockObjectId.toString())).rejects.toThrow("Invalid Role ID");
        });

        it("should throw error if deletedBy is not provided", async () => {
            await expect(roleRepository.roleDelete(mockObjectId.toString(), "")).rejects.toThrow("Deleted by user ID is required");
        });

        it("should delete (deactivate) role successfully", async () => {
            const mockRole = {
                _id: mockObjectId,
                code: "ADMIN",
                label: "Administrator",
                isActive: false,
            };

            (RoleModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockRole),
            });

            const result = await roleRepository.roleDelete(mockObjectId.toString(), mockObjectId.toString());

            expect(RoleModel.findByIdAndUpdate).toHaveBeenCalledWith(
                mockObjectId.toString(),
                expect.objectContaining({
                    isActive: false,
                }),
                { new: true }
            );
            expect(result).toEqual(mockRole);
        });

        it("should throw error if role not found", async () => {
            (RoleModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(roleRepository.roleDelete(mockObjectId.toString(), mockObjectId.toString())).rejects.toThrow("Role not found");
        });
    });
});
