import { employeeCreate, employeeFindAll, employeeFindById, CreateEmployeeInput } from "../../../src/features/employee/repository";
import * as employeeService from "../../../src/features/employee/service";

jest.mock("../../../src/repositories/employee.repository");

describe("EmployeeService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("findAllEmployees", () => {
        it("should return all employees", async () => {
            const mockEmployees = [
                {
                    _id: "1",
                    fullName: "John Doe",
                    email: "john@example.com",
                    isActive: true,
                },
            ] as any;

            (employeeFindAll as jest.Mock).mockResolvedValue(mockEmployees);

            const result = await employeeService.findAllEmployees({});
            expect(result).toEqual(mockEmployees);
        });
    });

    describe("findEmployeeById", () => {
        it("should return an employee by id", async () => {
            const mockEmployee = {
                _id: "1",
                fullName: "John Doe",
                email: "john@example.com",
                isActive: true,
            } as any;

            (employeeFindById as jest.Mock).mockResolvedValue(mockEmployee);

            const result = await employeeService.findEmployeeById("1");
            expect(result).toEqual(mockEmployee);
        });

        it("should throw error if employee not found", async () => {
            (employeeFindById as jest.Mock).mockRejectedValue(new Error("Employee not found"));

            await expect(employeeService.findEmployeeById("999")).rejects.toThrow("Employee not found");
        });
    });

    describe("createEmployee", () => {
        it("should create a new employee", async () => {
            const createData: CreateEmployeeInput = {
                fullName: "Jane Doe",
                email: "jane@example.com",
                passwordHash: "hashed_password",
                roleId: "1",
                createdBy: "1",
            };

            const mockEmployee = {
                _id: "2",
                ...createData,
                isActive: true,
            } as any;

            (employeeCreate as jest.Mock).mockResolvedValue(mockEmployee);

            const result = await employeeService.createEmployee(createData);
            expect(result).toEqual(mockEmployee);
        });

        it("should throw error if email already exists", async () => {
            const createData: CreateEmployeeInput = {
                fullName: "Jane Doe",
                email: "jane@example.com",
                passwordHash: "hashed_password",
                roleId: "1",
                createdBy: "1",
            };

            (employeeCreate as jest.Mock).mockRejectedValue(new Error("Employee with this email already exists"));

            await expect(employeeService.createEmployee(createData)).rejects.toThrow("Employee with this email already exists");
        });
    });
});
