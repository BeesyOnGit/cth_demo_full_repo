import { Types } from "mongoose";
import { Router } from "express";
import { QueryString } from "node:http";

export type AuditFields = {
    createdAt: Date;
    createdBy: Types.ObjectId;
    updatedAt: Date;
    updatedBy: Types.ObjectId;
    isActive: boolean;
};

export type EditHistoryEntry = {
    at: Date;
    by: Types.ObjectId;
    action: string;
    changes: Array<{
        field: string;
        from: any;
        to: any;
    }>;
};

export interface Routes {
    router: Router;
}
export type StdQueryOptions = {
    page?: number;
    limit?: number;
    noPag?: boolean;
    my?: boolean;
    _id?: string;
    search?: string;
};

export type StatsQueryOptions = {
    year?: number;
    month?: number;
    drId?: string;
    antenneId?: string;
    includeDetails?: boolean;
    employeeId?: string;
};
export type tokenPayload = {
    id: string;
    isAdmin: boolean;
    role: string;
    antenneId?: string | null;
    drId?: string | null;
    iat?: number;
    exp?: number;
};
