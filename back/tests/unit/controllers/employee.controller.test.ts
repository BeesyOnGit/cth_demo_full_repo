import { Request, Response, NextFunction } from "express";
import * as employeeController from "../../../src/features/employee/controller";
import * as employeeService from "../../../src/features/employee/service";

jest.mock("../../../src/services/employee.service");

describe("EmployeeController", () => {
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

    describe("getEmployees", () => {
        it("should return 200 and all employees", async () => {
            const mockEmployees = [
                {
                    _id: "1",
                    fullName: "John Doe",
                    email: "john@example.com",
                    isActive: true,
                },
            ] as any;

            (employeeService.findAllEmployees as jest.Mock).mockResolvedValue(mockEmployees);

            await employeeController.getEmployees(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockEmployees,
                message: "Employees retrieved successfully",
            });
        });

        it("should call next with error if service fails", async () => {
            const error = new Error("Database error");
            (employeeService.findAllEmployees as jest.Mock).mockRejectedValue(error);

            await employeeController.getEmployees(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getEmployeeById", () => {
        it("should return 200 and the employee", async () => {
            const mockEmployee = {
                _id: "1",
                fullName: "John Doe",
                email: "john@example.com",
                isActive: true,
            } as any;

            req.params = { id: "1" };
            (employeeService.findEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);

            await employeeController.getEmployeeById(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockEmployee,
                message: "Employee retrieved successfully",
            });
        });

        it("should return 400 if id not provided", async () => {
            req.params = {};

            await employeeController.getEmployeeById(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Employee ID is required" });
        });
    });

    describe("createEmployee", () => {
        it("should return 201 and created employee", async () => {
            const mockEmployee = {
                _id: "2",
                fullName: "Jane Doe",
                email: "jane@example.com",
                isActive: true,
            } as any;

            req.body = {
                fullName: "Jane Doe",
                email: "jane@example.com",
                passwordHash: "hashed_password",
                roleId: "1",
            };

            (employeeService.createEmployee as jest.Mock).mockResolvedValue(mockEmployee);

            await employeeController.createEmployee(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                data: mockEmployee,
                message: "Employee created successfully",
            });
        });
    });

    describe("updateEmployee", () => {
        it("should return 200 and updated employee", async () => {
            const mockEmployee = {
                _id: "1",
                fullName: "John Updated",
                email: "john@example.com",
                isActive: true,
            } as any;

            req.params = { id: "1" };
            req.body = { fullName: "John Updated" };

            (employeeService.updateEmployee as jest.Mock).mockResolvedValue(mockEmployee);

            await employeeController.updateEmployee(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockEmployee,
                message: "Employee updated successfully",
            });
        });
    });

    describe("deactivateEmployee", () => {
        it("should return 200 and deactivated employee", async () => {
            const mockEmployee = {
                _id: "1",
                fullName: "John Doe",
                email: "john@example.com",
                isActive: false,
            } as any;

            req.params = { id: "1" };
            req.body = {};

            (employeeService.deactivateEmployee as jest.Mock).mockResolvedValue(mockEmployee);

            await employeeController.deactivateEmployee(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: mockEmployee,
                message: "Employee deactivated successfully",
            });
        });

        it("should return 400 if id not provided", async () => {
            req.params = {};
            req.body = {};

            await employeeController.deactivateEmployee(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Employee ID is required" });
        });
    });
});
