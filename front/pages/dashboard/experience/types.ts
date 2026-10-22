export type EmployeeExperienceStatus = {
    generalStats: {
        byOuvrageType: {
            ouvrageType: string;
            stats: {
                employeeName: string;
                employeeId: string;
                projectCount: number;
            }[];
        }[];
        byServiceType: {
            serviceType: string;
            stats: {
                employeeName: string;
                employeeId: string;
                projectCount: number;
            }[];
        }[];
    };
    employeeDetails?: {
        employeeId: string;
        employeeName: string;
        totalProjects: number;
        experiences: {
            dr: string;
            antenne: string;
            ouvrageType: string;
            serviceType: string;
            projectNumber: string;
        }[];
    };
    period?: {
        start: Date;
        end: Date;
    };
};

export type DisplayMode = "table" | "pie" | "bar";

export type OuvrageTypeDataItem = {
    label: string;
    stats: {
        employeeName: string;
        employeeId: string;
        projectCount: number;
    }[];
};

export type ServiceTypeDataItem = {
    label: string;
    stats: {
        employeeName: string;
        employeeId: string;
        projectCount: number;
    }[];
};

export type EmployeeStatItem = {
    employeeName: string;
    employeeId: string;
    projectCount: number;
};
