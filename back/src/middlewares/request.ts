import { NextFunction, Request, Response } from "express";
import { StatsQueryOptions, StdQueryOptions } from "../utils/interface";
import { wilayaFilterFields } from "../features/wilaya/controller";
import { communeFilterFields } from "../features/commune/controller";
import { drFilterFields } from "../features/dr/controller";
import { roleFilterFields } from "../features/role/controller";
import { antenneFilterFields } from "../features/antenne/controller";
import { employeeFilterFields } from "../features/employee/controller";
import { projectFilterFields } from "../features/project/controller";
import { clientFilterFields } from "../features/client/controller";
import { vatFilterFields } from "../features/vat-rate/controller";
import { invoiceFilterFields } from "../features/invoice/controller";
import { clientTypeFilterFields } from "../features/client-type/controller";
import { serviceTypeFilterFields } from "../features/service-type/controller";
import { ouvrageTypeFilterFields } from "../features/ouvrage-type/controller";
import { objectiveFilterFields } from "../features/objective/controller";
import { config } from "../config/index";
import { httpError } from "../utils/access";

const statsFilterFields = ["year", "month", "drId", "antenneId", "includeDetails", "employeeId"] as const satisfies (keyof StatsQueryOptions)[];

const allowedQueryFieldsMap: Record<string, ReadonlyArray<string>> = {
    wilayas: wilayaFilterFields,
    communes: communeFilterFields,
    drs: drFilterFields,
    roles: roleFilterFields,
    antennes: antenneFilterFields,
    employees: employeeFilterFields,
    projects: projectFilterFields,
    clients: clientFilterFields,
    vat: vatFilterFields,
    invoices: invoiceFilterFields,
    "client-types": clientTypeFilterFields,
    "service-types": serviceTypeFilterFields,
    "ouvrage-types": ouvrageTypeFilterFields,
    objectives: objectiveFilterFields,
    stats: statsFilterFields,
};

const paginationFilterFields = ["limit", "page", "noPag", "_id", "search"] as const satisfies (keyof StdQueryOptions)[];

// Middleware to clean query parameters based on allowed fields for each resource
export function cleanQuery(req: Request, res: Response, next: NextFunction) {
    try {
        const { query, path } = req;
        // extract the first segment of the path to identify the resource
        const pathKey = path.split("/")[1];

        // Reject nested objects / arrays (e.g. ?isActive[$ne]=true) to prevent operator injection
        for (const key in query) {
            if (typeof query[key] !== "string") throw httpError(400, `Invalid query parameter: ${key}`);
        }

        const allowedFields = allowedQueryFieldsMap[pathKey];
        const filteredQuery = getOnlyWantedQuery(allowedFields ? [...allowedFields, ...paginationFilterFields] : [...paginationFilterFields], query);
        normalizePagination(filteredQuery);
        req.query = filteredQuery;
        next();
    } catch (error) {
        next(error);
    }
}

function normalizePagination(query: Record<string, any>) {
    if (query.limit !== undefined) query.limit = Math.min(Math.max(Math.trunc(Number(query.limit)) || config.pageginationDefaultLimit, 1), 100);
    if (query.page !== undefined) query.page = Math.max(Math.trunc(Number(query.page)) || 1, 1);
    if (query.noPag !== undefined) query.noPag = query.noPag === "true";
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function getOnlyWantedQuery(wantedArray: string[], query: Record<string, any>) {
    let tmpQuery: Record<string, any> = {};

    for (const field of wantedArray) {
        if (field === "search" && query["search"] !== undefined && query["search"] !== null) {
            const value = new RegExp(escapeRegex(String(query["search"]).slice(0, 100)), "i");

            tmpQuery = {
                ...tmpQuery,
                $or: [
                    { name: value },
                    { identifier: value },
                    { label: value },
                    { code: value },
                    { communeLt: value },
                    { fullName: value },
                    { email: value },
                    { title: value },
                    { projectNumber: value },
                    { invoiceNumber: value },
                ],
            };
            continue;
        }

        if (query[field] !== undefined && query[field] !== null && query[field] !== "") {
            const result = constructQuery(query[field], "include", field);

            // Handle the special case where constructQuery returns $or for null/undefined handling
            if (result && typeof result === "object" && "$or" in result) {
                // If tmpQuery already has $or, we need to combine them
                if (tmpQuery.$or) {
                    tmpQuery.$and = tmpQuery.$and || [];
                    tmpQuery.$and.push({ $or: tmpQuery.$or }, { $or: result.$or });
                    delete tmpQuery.$or;
                } else {
                    tmpQuery.$or = result.$or;
                }
            } else {
                tmpQuery = { ...tmpQuery, [field]: result };
            }
        }
    }

    for (const key in query) {
        if (tmpQuery[key]) {
            continue;
        }
        if (key.includes(".") && wantedArray.includes(key.split(".")[0])) {
            // Only primitive values are allowed for dotted keys (no operator objects)
            let value: unknown = query[key];
            try {
                value = JSON.parse(query[key]);
            } catch {
                // keep the raw string
            }
            if (value !== null && typeof value === "object") throw httpError(400, `Invalid query parameter: ${key}`);
            tmpQuery[key] = value;
        }
    }

    return tmpQuery;
}

// Helper function to construct mongo query based on string values (transforme a , separated Str to an array)
function constructQuery(query: string, type: "include" | "exclude" | "contain", field?: string) {
    if (typeof query !== "string") {
        return query;
    }
    if (!query.includes(",") && type !== "contain") {
        return query;
    }
    if (type === "contain") {
        // is equal to the value or contains it as a substring
        return { $regex: query, $options: "i" };
    }
    // if (type === "contain") {
    //     return { $all: query.split(",") };
    // }
    if (type === "include") {
        const values = query.split(",");
        // Check if 'undefined', 'null', or empty strings are present
        const hasUndefined = values.some((v) => v === "undefined" || v === "null" || v === "");
        const validValues = values.filter((v) => v !== "undefined" && v !== "null" && v !== "");

        // If 'undefined' is present and we have a field name, create proper $or structure
        if (hasUndefined && field) {
            const orConditions: any[] = [];

            if (validValues.length > 0) {
                orConditions.push({ [field]: { $in: validValues } });
            }
            orConditions.push({ [field]: { $size: 0 } });
            orConditions.push({ [field]: { $exists: false } });

            return { $or: orConditions };
        }

        return { $in: validValues };
    }
    return { $nin: query.split(",") };
}
