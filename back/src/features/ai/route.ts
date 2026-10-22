import { Router } from "express";
import { businessChat, generateQueries } from "./controller";
import { authCheck } from "../../middlewares/auth";
import { rateLimit } from "../../middlewares/rateLimit";

const router = Router();
const Root = "/ai";

const aiRateLimit = rateLimit({ windowMs: 60 * 1000, max: 10, key: (req) => `${req.headers.userid || req.ip}` });

// POST endpoint for business chat
router.post(`${Root}/business-chat`, authCheck, aiRateLimit, businessChat);

// POST endpoint for query generation
// router.post(`${Root}/generate-queries`, authCheck, generateQueries);

export default router;
