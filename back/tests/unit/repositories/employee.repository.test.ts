import * as employeeRepository from "../../../src/features/employee/repository";
import { EmployeeModel } from "../../../src/features/employee/model";
import { Types } from "mongoose";

jest.mock("../../../src/models/employee.model");

describe("EmployeeRepository", () => {
    const mockObjectId = new Types.ObjectId();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("employeeFindAll", () => {
        it("should return all active employees", async () => {
            const mockEmployees = [
                {
                    _id: mockObjectId,
                    fullName: "John Doe",
                    email: "john@example.com",
                    isActive: true,
                },
            ];

            (EmployeeModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockEmployees),
            });

            const result = await employeeRepository.employeeFindAll({});

            expect(EmployeeModel.find).toHaveBeenCalledWith({ isActive: true });
            expect(result).toEqual(mockEmployees);
        });

        it("should exclude passwordHash from results", async () => {
            const mockSelect = jest.fn().mockReturnThis();
            (EmployeeModel.find as jest.Mock).mockReturnValue({
                select: mockSelect,
                populate: jest.fn().mockResolvedValue([]),
            });

            await employeeRepository.employeeFindAll({});

            expect(mockSelect).toHaveBeenCalledWith("-passwordHash");
        });
    });

    describe("employeeFindById", () => {
        it("should throw error if id is not provided", async () => {
            await expect(employeeRepository.employeeFindById("")).rejects.toThrow("Employee ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            await expect(employeeRepository.employeeFindById("invalid-id")).rejects.toThrow("Invalid Employee ID");
        });

        it("should return employee if found", async () => {
            const mockEmployee = {
                _id: mockObjectId,
                fullName: "John Doe",
                email: "john@example.com",
                isActive: true,
            };

            (EmployeeModel.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockEmployee),
            });

            const result = await employeeRepository.employeeFindById(mockObjectId.toString());

            expect(EmployeeModel.findById).toHaveBeenCalledWith(mockObjectId.toString());
            expect(result).toEqual(mockEmployee);
        });

        it("should throw error if employee not found", async () => {
            (EmployeeModel.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(employeeRepository.employeeFindById(mockObjectId.toString())).rejects.toThrow("Employee not found");
        });
    });

    describe("employeeCreate", () => {
        it("should throw error if fullName is not provided", async () => {
            const data = {
                fullName: "",
                email: "john@example.com",
                passwordHash: "hashed",
                roleId: mockObjectId.toString(),
                createdBy: mockObjectId.toString(),
            };

            await expect(employeeRepository.employeeCreate(data)).rejects.toThrow("Full name is required");
        });

        it("should throw error if email is not provided", async () => {
            const data = {
                fullName: "John Doe",
                email: "",
                passwordHash: "hashed",
                roleId: mockObjectId.toString(),
                createdBy: mockObjectId.toString(),
            };

            await expect(employeeRepository.employeeCreate(data)).rejects.toThrow("Email is required");
        });

        it("should throw error if passwordHash is not provided", async () => {
            const data = {
                fullName: "John Doe",
                email: "john@example.com",
                passwordHash: "",
                roleId: mockObjectId.toString(),
                createdBy: mockObjectId.toString(),
            };

            await expect(employeeRepository.employeeCreate(data)).rejects.toThrow("Password hash is required");
        });

        it("should throw error if roleId is not provided", async () => {
            const data = {
                fullName: "John Doe",
                email: "john@example.com",
                passwordHash: "hashed",
                roleId: "",
                createdBy: mockObjectId.toString(),
            };

            await expect(employeeRepository.employeeCreate(data)).rejects.toThrow("Role ID is required");
        });

        it("should throw error if createdBy is not provided", async () => {
            const data = {
                fullName: "John Doe",
                email: "john@example.com",
                passwordHash: "hashed",
                roleId: mockObjectId.toString(),
                createdBy: "",
            };

            await expect(employeeRepository.employeeCreate(data)).rejects.toThrow("Created by user ID is required");
        });

        it("should throw error if email already exists", async () => {
            const data = {
                fullName: "John Doe",
                email: "john@example.com",
                passwordHash: "hashed",
                roleId: mockObjectId.toString(),
                createdBy: mockObjectId.toString(),
            };

            (EmployeeModel.findOne as jest.Mock).mockResolvedValue({
                _id: mockObjectId,
                email: "john@example.com",
            });

            await expect(employeeRepository.employeeCreate(data)).rejects.toThrow("Employee with this email already exists");
        });

        it("should create and return new employee", async () => {
            const data = {
                fullName: "John Doe",
                email: "john@example.com",
                passwordHash: "hashed",
                roleId: mockObjectId.toString(),
                createdBy: mockObjectId.toString(),
            };

            const mockSave = jest.fn().mockResolvedValue({
                _id: mockObjectId,
                ...data,
                isActive: true,
                populate: jest.fn().mockResolvedValue({
                    _id: mockObjectId,
                    ...data,
                    isActive: true,
                }),
            });

            (EmployeeModel.findOne as jest.Mock).mockResolvedValue(null);
            (EmployeeModel as any).mockImplementation(() => ({
                save: mockSave,
                populate: jest.fn().mockResolvedValue({
                    _id: mockObjectId,
                    ...data,
                    isActive: true,
                }),
            }));

            const result = await employeeRepository.employeeCreate(data);

            expect(result).toBeDefined();
            expect(mockSave).toHaveBeenCalled();
        });
    });

    describe("employeeUpdate", () => {
        it("should throw error if id is not provided", async () => {
            const data = {
                id: "",
                fullName: "Updated Name",
                updatedBy: mockObjectId.toString(),
            };

            await expect(employeeRepository.employeeUpdate(data as any)).rejects.toThrow("Employee ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            const data = {
                id: "invalid-id",
                fullName: "Updated Name",
                updatedBy: mockObjectId.toString(),
            };

            await expect(employeeRepository.employeeUpdate(data as any)).rejects.toThrow("Invalid Employee ID");
        });

        it("should throw error if updatedBy is not provided", async () => {
            const data = {
                id: mockObjectId.toString(),
                fullName: "Updated Name",
                updatedBy: "",
            };

            await expect(employeeRepository.employeeUpdate(data as any)).rejects.toThrow("Updated by user ID is required");
        });

        it("should throw error if employee not found", async () => {
            const data = {
                id: mockObjectId.toString(),
                fullName: "Updated Name",
                updatedBy: mockObjectId.toString(),
            };

            (EmployeeModel.findById as jest.Mock).mockResolvedValue(null);

            await expect(employeeRepository.employeeUpdate(data as any)).rejects.toThrow("Employee not found");
        });

        it("should update and return employee", async () => {
            const data = {
                id: mockObjectId.toString(),
                fullName: "Updated Name",
                updatedBy: mockObjectId.toString(),
            };

            const mockUpdated = {
                _id: mockObjectId,
                fullName: "Updated Name",
                isActive: true,
            };

            (EmployeeModel.findById as jest.Mock).mockResolvedValue({
                _id: mockObjectId,
                fullName: "John Doe",
            });

            (EmployeeModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockUpdated),
            });

            const result = await employeeRepository.employeeUpdate(data as any);

            expect(EmployeeModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(result).toEqual(mockUpdated);
        });
    });

    describe("employeeDeactivate", () => {
        it("should throw error if id is not provided", async () => {
            await expect(employeeRepository.employeeDeactivate("", mockObjectId.toString())).rejects.toThrow("Employee ID is required");
        });

        it("should throw error if id format is invalid", async () => {
            await expect(employeeRepository.employeeDeactivate("invalid-id", mockObjectId.toString())).rejects.toThrow("Invalid Employee ID");
        });

        it("should throw error if deactivatedBy is not provided", async () => {
            await expect(employeeRepository.employeeDeactivate(mockObjectId.toString(), "")).rejects.toThrow("Deactivated by user ID is required");
        });

        it("should throw error if employee not found", async () => {
            (EmployeeModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(employeeRepository.employeeDeactivate(mockObjectId.toString(), mockObjectId.toString())).rejects.toThrow(
                "Employee not found"
            );
        });

        it("should deactivate and return employee", async () => {
            const mockDeactivated = {
                _id: mockObjectId,
                fullName: "John Doe",
                isActive: false,
            };

            (EmployeeModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockDeactivated),
            });

            const result = await employeeRepository.employeeDeactivate(mockObjectId.toString(), mockObjectId.toString());

            expect(EmployeeModel.findByIdAndUpdate).toHaveBeenCalled();
            expect(result).toEqual(mockDeactivated);
        });
    });

    describe("employeeFindByFilters", () => {
        it("should return employees filtered by roleId", async () => {
            const mockEmployees = [
                {
                    _id: mockObjectId,
                    roleId: mockObjectId,
                    fullName: "John Doe",
                    isActive: true,
                },
            ];

            (EmployeeModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockEmployees),
            });

            const result = await employeeRepository.employeeFindByFilters({ roleId: mockObjectId.toString() });

            expect(result).toEqual(mockEmployees);
        });

        it("should throw error if roleId format is invalid", async () => {
            await expect(employeeRepository.employeeFindByFilters({ roleId: "invalid-id" })).rejects.toThrow("Invalid Role ID");
        });

        it("should return employees filtered by antenneId", async () => {
            const mockEmployees = [
                {
                    _id: mockObjectId,
                    antenneId: mockObjectId,
                    fullName: "John Doe",
                    isActive: true,
                },
            ];

            (EmployeeModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockEmployees),
            });

            const result = await employeeRepository.employeeFindByFilters({ antenneId: mockObjectId.toString() });

            expect(result).toEqual(mockEmployees);
        });

        it("should throw error if antenneId format is invalid", async () => {
            await expect(employeeRepository.employeeFindByFilters({ antenneId: "invalid-id" })).rejects.toThrow("Invalid Antenne ID");
        });

        it("should return employees filtered by drId", async () => {
            const mockEmployees = [
                {
                    _id: mockObjectId,
                    drId: mockObjectId,
                    fullName: "John Doe",
                    isActive: true,
                },
            ];

            (EmployeeModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockEmployees),
            });

            const result = await employeeRepository.employeeFindByFilters({ drId: mockObjectId.toString() });

            expect(result).toEqual(mockEmployees);
        });

        it("should throw error if drId format is invalid", async () => {
            await expect(employeeRepository.employeeFindByFilters({ drId: "invalid-id" })).rejects.toThrow("Invalid DR ID");
        });

        it("should return employees filtered by multiple criteria", async () => {
            const mockEmployees = [
                {
                    _id: mockObjectId,
                    roleId: mockObjectId,
                    drId: mockObjectId,
                    fullName: "John Doe",
                    isActive: true,
                },
            ];

            (EmployeeModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockEmployees),
            });

            const result = await employeeRepository.employeeFindByFilters({
                roleId: mockObjectId.toString(),
                drId: mockObjectId.toString(),
            });

            expect(result).toEqual(mockEmployees);
        });

        it("should return employees filtered by wilayaId", async () => {
            const mockEmployees = [
                {
                    _id: mockObjectId,
                    wilayaId: mockObjectId,
                    fullName: "John Doe",
                    isActive: true,
                },
            ];

            (EmployeeModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockEmployees),
            });

            const result = await employeeRepository.employeeFindByFilters({ wilayaId: mockObjectId.toString() });

            expect(result).toEqual(mockEmployees);
        });

        it("should throw error if wilayaId format is invalid", async () => {
            await expect(employeeRepository.employeeFindByFilters({ wilayaId: "invalid-id" })).rejects.toThrow("Invalid Wilaya ID");
        });

        it("should filter by isActive status", async () => {
            const mockEmployees = [
                {
                    _id: mockObjectId,
                    fullName: "John Doe",
                    isActive: false,
                },
            ];

            (EmployeeModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockEmployees),
            });

            const result = await employeeRepository.employeeFindByFilters({ isActive: false });

            expect(result).toEqual(mockEmployees);
        });

        it("should return all active employees with empty filters", async () => {
            const mockEmployees = [
                {
                    _id: mockObjectId,
                    fullName: "John Doe",
                    isActive: true,
                },
            ];

            (EmployeeModel.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockEmployees),
            });

            const result = await employeeRepository.employeeFindByFilters({});

            expect(result).toEqual(mockEmployees);
        });
    });
});
