import { Router } from "express";
import { getVatRateById, getVatRates, createVatRate, updateVatRate, deleteVatRate } from "./controller";
import { authCheck, adminCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";

const router = Router();
const Root = "/vat";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, getVatRates);
router.get(`${Root}/:id`, authCheck, getVatRateById);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createVatRate);
// PUT endpoints
router.put(`${Root}/:id`, authCheck, adminCheck, updateVatRate);

// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, adminCheck, deleteVatRate);

export default router;
