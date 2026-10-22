import { Request, Response, NextFunction } from "express";
import * as roleController from "../../../src/features/role/controller";
import * as roleService from "../../../src/features/role/service";

jest.mock("../../../src/services/role.service");

describe("RoleController", () => {
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

    describe("getRoles", () => {
        it("should return 200 and all roles", async () => {
            const mockRoles = [
                {
                    _id: "1",
                    code: "ADMIN",
                    label: "Administrator",
                    isActive: true,
                },
            ] as any;

            (roleService.findAllRoles as jest.Mock).mockResolvedValue(mockRoles);

            await roleController.getRoles(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockRoles,
                message: "Roles retrieved successfully",
            });
        });

        it("should call next with error if service fails", async () => {
            const error = new Error("Database error");
            (roleService.findAllRoles as jest.Mock).mockRejectedValue(error);

            await roleController.getRoles(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getRoleById", () => {
        it("should return 200 and the role", async () => {
            const mockRole = {
                _id: "1",
                code: "ADMIN",
                label: "Administrator",
                isActive: true,
            } as any;

            req.params = { id: "1" };
            (roleService.findRoleById as jest.Mock).mockResolvedValue(mockRole);

            await roleController.getRoleById(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockRole,
                message: "Role retrieved successfully",
            });
        });

        it("should return 400 if id not provided", async () => {
            req.params = {};

            await roleController.getRoleById(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Role ID is required" });
        });
    });

    describe("createRole", () => {
        it("should return 201 and created role", async () => {
            const mockRole = {
                _id: "2",
                code: "MANAGER",
                label: "Manager",
                permissions: ["read", "write"],
                isActive: true,
            } as any;

            req.body = {
                code: "MANAGER",
                label: "Manager",
                permissions: ["read", "write"],
            };

            (roleService.createRole as jest.Mock).mockResolvedValue(mockRole);

            await roleController.createRole(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                data: mockRole,
                message: "Role created successfully",
            });
        });

        it("should return 400 if required fields are missing", async () => {
            req.body = { code: "MANAGER" };

            await roleController.createRole(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Missing required fields: code, label",
            });
        });
    });

    describe("updateRole", () => {
        it("should return 200 and updated role", async () => {
            const mockRole = {
                _id: "1",
                code: "ADMIN",
                label: "Updated Label",
                isActive: true,
            } as any;

            req.params = { id: "1" };
            req.body = { label: "Updated Label" };

            (roleService.updateRole as jest.Mock).mockResolvedValue(mockRole);

            await roleController.updateRole(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockRole,
                message: "Role updated successfully",
            });
        });

        it("should return 400 if id not provided", async () => {
            req.params = {};

            await roleController.updateRole(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Role ID is required" });
        });
    });

    describe("deleteRole", () => {
        it("should return 200 and deleted role", async () => {
            const mockRole = {
                _id: "1",
                code: "ADMIN",
                label: "Administrator",
                isActive: false,
            } as any;

            req.params = { id: "1" };

            (roleService.deleteRole as jest.Mock).mockResolvedValue(mockRole);

            await roleController.deleteRole(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockRole,
                message: "Role deleted successfully",
            });
        });

        it("should return 400 if id not provided", async () => {
            req.params = {};

            await roleController.deleteRole(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Role ID is required" });
        });
    });
});
