import { Router } from "express";
import { getWilayaByCode, getWilayas, createWilaya, updateWilaya, deleteWilaya } from "./controller";
import { adminCheck, authCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";

const router = Router();
const Root = "/wilayas";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, getWilayas);
router.get(`${Root}/:code`, authCheck, getWilayaByCode);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createWilaya);
// PUT endpoints
router.put(`${Root}/:code`, authCheck, adminCheck, updateWilaya);

// DELETE endpoints
router.delete(`${Root}/:code`, authCheck, adminCheck, deleteWilaya);

export default router;
