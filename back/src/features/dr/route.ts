import { Router } from "express";
import { getDrById, getDrs, createDr, updateDr, deleteDr } from "./controller";
import { authCheck, adminCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";
import { limitationMiddleware } from "../../middlewares/limitation";

const router = Router();
const Root = "/drs";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, limitationMiddleware, getDrs);
router.get(`${Root}/:id`, authCheck, getDrById);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createDr);
// PUT endpoints
router.put(`${Root}/:id`, authCheck, adminCheck, updateDr);

// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, adminCheck, deleteDr);

export default router;
