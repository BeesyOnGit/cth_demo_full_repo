import { NextFunction, Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
import { isValidObjectId, Model } from "mongoose";

export function httpError(status: number, message: string) {
    return Object.assign(new Error(message), { status });
}

const PROTECTED_FIELDS = ["_id", "id", "createdBy", "createdAt", "editHistory", "passwordHash", "__v"];
const ADMIN_ONLY_FIELDS = ["isAdmin", "isActive", "drId", "antenneId"];

// Remove fields a client must never set through a generic update body
export function stripProtected<T extends Record<string, any>>(body: T, isAdmin?: boolean, extra: string[] = []): T {
    const copy: any = { ...body };
    for (const field of [...PROTECTED_FIELDS, ...(isAdmin ? [] : ADMIN_ONLY_FIELDS), ...extra]) delete copy[field];
    return copy;
}

// Same scope rule as limitationMiddleware: antenne users see their antenne, DR users their DR, admins everything
export function isInScope(doc: { drId?: any; antenneId?: any }, headers: IncomingHttpHeaders) {
    if (headers.isadmin) return true;
    const idOf = (v: any) => (v?._id ?? v)?.toString();
    if (headers.antenneid) return idOf(doc.antenneId) === headers.antenneid;
    if (headers.drid) return idOf(doc.drId) === headers.drid;
    return true;
}

export async function assertDocInScope(model: Model<any>, id: unknown, headers: IncomingHttpHeaders) {
    if (!isValidObjectId(id)) throw httpError(400, "Invalid ID");
    if (headers.isadmin) return;
    const doc = await model.findById(id).select("drId antenneId").lean<{ drId?: any; antenneId?: any }>();
    if (!doc || !isInScope(doc, headers)) throw httpError(404, "Not found");
}

// Route guard for /:id routes of DR/antenne scoped resources
export const scopeById = (model: Model<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await assertDocInScope(model, req.params.id, req.headers);
        next();
    } catch (error) {
        next(error);
    }
};
