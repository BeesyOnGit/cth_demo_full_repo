import { NextFunction, Request, Response } from "express";
import { authCookieOptions, isTokenExpired, refreshAuth, verifyToken } from "../utils/token";
import logger from "../utils/logger";
import { tokenPayload } from "../utils/interface";

// Identity headers are only ever set from verified claims; client-sent values are discarded
function setIdentityHeaders(req: Request, { id, isAdmin, role, antenneId, drId }: tokenPayload) {
    delete req.headers.antenneid;
    delete req.headers.drid;
    req.headers.userid = id;
    req.headers.isadmin = isAdmin;
    req.headers.role = role;
    if (antenneId && antenneId !== "undefined") {
        req.headers.antenneid = antenneId;
    }
    if (drId && drId !== "undefined") {
        req.headers.drid = drId;
    }
}

export async function authCheck(req: Request, res: Response, next: NextFunction) {
    try {
        const { headers, cookies } = req;
        // const {} = headers;
        const { authorization, refreshAuthorization } = cookies;

        if (!authorization) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const clearClaims = verifyToken(authorization);

        if (!clearClaims) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { exp } = clearClaims;

        const isExpired = isTokenExpired({ exp: exp! });

        if (!isExpired) {
            // refresh before handing over so the cookie is set before the response is sent
            const refreshed = refreshAuthorization ? await refreshAuth({ refreshToken: refreshAuthorization, res, authExp: exp! }) : false;
            setIdentityHeaders(req, refreshed || clearClaims);
            return next();
        }

        if (!refreshAuthorization) {
            return res.status(401).json({ message: "Session expired" });
        }

        const newClaims = await refreshAuth({ refreshToken: refreshAuthorization, res, authExp: 0 });

        if (!newClaims) {
            res.clearCookie("authorization", authCookieOptions);
            res.clearCookie("refreshAuthorization", authCookieOptions);
            return res.status(401).json({ message: "Session expired" });
        }

        setIdentityHeaders(req, newClaims);
        next();

        // return res.status(401).json({ message: "Session expired" });
    } catch (error) {
        logger.error("🚀 ~ file: auth.ts:36 ~ authCheck ~ error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export function adminCheck(req: Request, res: Response, next: NextFunction) {
    const { isadmin } = req.headers;
    if (!isadmin) {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
}
