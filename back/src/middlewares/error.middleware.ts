import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

interface HttpException extends Error {
    status?: number;
    message: string;
}

// Repositories throw plain Errors; map the well-known ones to client errors
function inferStatus(error: HttpException): number {
    if (error.status) return error.status;
    if (["CastError", "ValidationError", "BSONError", "StrictModeError"].includes(error.name)) return 400;
    if (/not found/i.test(error.message || "")) return 404;
    if (/invalid .*id|is required/i.test(error.message || "")) return 400;
    return 500;
}

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
    const status = inferStatus(error);
    const message = error.message || "Something went wrong";

    // Extract file, function, and line from error stack
    let fileInfo = "unknown";
    let functionInfo = "unknown";
    let lineInfo = "unknown";

    if (error.stack) {
        const stackLines = error.stack.split("\n");
        // Typically the second line contains the actual error location
        const relevantLine = stackLines[1] || stackLines[0];

        // Extract file path and line number (pattern: at functionName (file:line:column))
        const match = relevantLine.match(/at\s+(?:(\S+)\s+\()?([^()]+):(\d+):(\d+)\)?/);

        if (match) {
            functionInfo = match[1] || "anonymous";
            const fullPath = match[2];
            lineInfo = match[3];

            // Extract just the filename from full path
            const pathParts = fullPath.split(/[/\\]/);
            fileInfo = pathParts[pathParts.length - 1];
        }
    }

    logger.error(
        `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message} ~ file: ${fileInfo} ~ function: ${functionInfo} ~ line: ${lineInfo}`
    );

    res.status(status).json({
        status,
        // never leak internals (stack/driver messages) for unexpected errors in production
        message: status >= 500 && process.env.NODE_ENV === "production" ? "Internal server error" : message,
    });
};

export default errorMiddleware;
