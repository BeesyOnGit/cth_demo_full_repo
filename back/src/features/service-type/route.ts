import { Router } from "express";
import { getServiceTypeById, getServiceTypes, createServiceType, updateServiceType, deleteServiceType } from "./controller";
import { authCheck, adminCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";
const router = Router();
const Root = "/service-types";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, getServiceTypes);
router.get(`${Root}/:id`, authCheck, getServiceTypeById);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createServiceType);
// PUT endpoints
router.put(`${Root}/:id`, authCheck, adminCheck, updateServiceType);

// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, adminCheck, deleteServiceType);

export default router;
