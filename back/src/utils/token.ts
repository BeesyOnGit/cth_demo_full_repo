import jwt from "jsonwebtoken";
import { config } from "../config/index";
import { tokenPayload } from "./interface";
import { Response } from "express";
import logger from "./logger";
import { timeUniConversion } from "./time";
import { EmployeeModel } from "../features/employee/model";

const { jwtSecret, jwtAuthRefresh, jwtExpiration, jwtRefreshExpiration } = config;

// Token lifetimes in seconds (jwt expiresIn) - cookies use the same values in ms
export const authTokenTtl = timeUniConversion({ time: parseInt(jwtExpiration) || 8, unit: "hours", returUnit: "seconds" }); // default 8 hours
export const refreshTokenTtl = timeUniConversion({ time: parseInt(jwtRefreshExpiration) || 7, unit: "days", returUnit: "seconds" }); // default 7 days

// Front and API are served from the same site, so "lax" is enough and blocks cross-site requests carrying the session
export const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
} as const;

export function buildTokenPayload(employee: { _id: any; roleId: any; isAdmin?: boolean; antenneId?: any; drId?: any }): tokenPayload {
    return {
        id: employee._id.toString(),
        role: employee.roleId.toString(),
        isAdmin: employee.isAdmin || false,
        antenneId: employee.antenneId ? employee.antenneId.toString() : null,
        drId: employee.drId ? employee.drId.toString() : null,
    };
}

export function generateToken({ payload, expire }: { payload: tokenPayload; expire: number }): string | false {
    try {
        // const expiration = (parseInt(jwtExpiration) || 8) * 3600; // default to 8 hours
        const token = jwt.sign(payload, jwtSecret, { expiresIn: expire });
        return token;
    } catch (error) {
        logger.error("🚀 ~ file: token.ts:7 ~ generateToken ~ error:", error);
        return false;
    }
}

export function verifyToken(token: string): tokenPayload | false {
    try {
        const decoded = jwt.verify(token, jwtSecret, { ignoreExpiration: true }) as tokenPayload;
        return decoded;
    } catch (error) {
        logger.error("🚀 ~ file: token.ts:20 ~ verifyToken ~ error:", error);
        return false;
    }
}

export function isTokenExpired({ exp }: { exp: number }): boolean {
    try {
        const currentTime = Date.now();
        const expInMillis = timeUniConversion({ time: exp, unit: "seconds", returUnit: "milliseconds" });
        return expInMillis ? expInMillis < currentTime : true;
    } catch (error) {
        logger.error("🚀 ~ file: token.ts:33 ~ isTokenExpired ~ error:", error);
        return true;
    }
}

export async function refreshAuth({ refreshToken, res, authExp }: { refreshToken: string; res: Response; authExp: number }): Promise<tokenPayload | false> {
    try {
        const maxExpiryForRefresh = timeUniConversion({ time: parseInt(jwtAuthRefresh) || 5, unit: "minutes", returUnit: "milliseconds" }); // default to 5 minutes
        const currentTime = Date.now();
        const authExpInMillis = timeUniConversion({ time: authExp, unit: "seconds", returUnit: "milliseconds" });

        if (authExp > 0 && authExpInMillis > currentTime + maxExpiryForRefresh) {
            return false;
        }

        const clearClaims = verifyToken(refreshToken);

        if (!clearClaims) {
            return false;
        }
        const { id, exp } = clearClaims;

        const isExpired = isTokenExpired({ exp: exp! });

        if (isExpired) {
            return false;
        }

        // Re-load the employee: deactivated users lose access and role/scope changes apply immediately
        const employee = await EmployeeModel.findById(id).select("roleId isAdmin antenneId drId isActive").lean();
        if (!employee || !employee.isActive) {
            return false;
        }

        const payload = buildTokenPayload(employee);
        const newToken = generateToken({ payload, expire: authTokenTtl });

        if (!newToken) {
            return false;
        }

        res.cookie("authorization", newToken, { ...authCookieOptions, maxAge: authTokenTtl * 1000 });

        return payload;
    } catch (error) {
        logger.error("🚀 ~ file: token.ts:43 ~ refreshAuth ~ error:", error);
        return false;
    }
}
