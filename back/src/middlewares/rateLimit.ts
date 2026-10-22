import { NextFunction, Request, Response } from "express";

// ponytail: in-memory, per-process counters; move to a shared store (redis) if the API runs on several instances
export function rateLimit({ windowMs, max, key }: { windowMs: number; max: number; key: (req: Request) => string }) {
    const hits = new Map<string, { count: number; reset: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
        const now = Date.now();
        if (hits.size > 10000) hits.forEach((v, k) => v.reset <= now && hits.delete(k));

        const k = key(req);
        let entry = hits.get(k);
        if (!entry || entry.reset <= now) {
            entry = { count: 0, reset: now + windowMs };
            hits.set(k, entry);
        }

        if (++entry.count > max) {
            res.setHeader("Retry-After", Math.ceil((entry.reset - now) / 1000));
            return res.status(429).json({ message: "Too many requests, please try again later" });
        }
        next();
    };
}
