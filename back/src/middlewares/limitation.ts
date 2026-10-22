import { NextFunction, Request, Response } from "express";
import { AntenneModel } from "../features/antenne/model";

export async function limitationMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const { headers, query, path } = req;
        const { userid, antenneid, drid, isadmin } = headers;
        console.log("🚀 ~ file: limitation.ts:7 ~ limitationMiddleware ~ antenneid:", antenneid, typeof antenneid);

        const pathKey = path.split("/")[1];

        let addReq = {};

        if (isadmin) {
            next();
            return;
        }

        if (drid && drid !== "undefined") {
            addReq = { drId: drid };
        }

        if (antenneid && antenneid !== "undefined") {
            addReq = { antenneId: antenneid };
        }

        // Stats endpoints filter mostly by drId: pin both DR and antenne so non-admins can't query other scopes
        if (pathKey === "stats" && antenneid && antenneid !== "undefined") {
            const antenne = drid && drid !== "undefined" ? null : await AntenneModel.findById(antenneid).select("drId").lean<{ drId?: any }>();
            addReq = { antenneId: antenneid, drId: antenne ? `${antenne.drId}` : drid };
        } else if (pathKey === "stats" && drid && drid !== "undefined" && query.antenneId) {
            // DR users may only look at antennes of their own DR
            const antenne = await AntenneModel.findById(query.antenneId).select("drId").lean<{ drId?: any }>();
            if (!antenne || `${antenne.drId}` !== drid) {
                return res.status(403).json({ message: "Forbidden: antenne outside of your scope" });
            }
        }

        req.query = { ...query, ...addReq };
        console.log("🚀 ~ file: limitation.ts:9 ~ limitationMiddleware ~ pathKey:", pathKey);
        console.log("🚀 ~ file: limitation.ts:26 ~ limitationMiddleware ~ { ...query, ...addReq }:", { ...query, ...addReq });
        next();
    } catch (error) {
        next(error);
    }
}
