import { Router } from "express";
import { getOuvrageTypeById, getOuvrageTypes, createOuvrageType, updateOuvrageType, deleteOuvrageType } from "./controller";
import { authCheck, adminCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";
const router = Router();
const Root = "/ouvrage-types";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, getOuvrageTypes);
router.get(`${Root}/:id`, authCheck, getOuvrageTypeById);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createOuvrageType);
// PUT endpoints
router.put(`${Root}/:id`, authCheck, adminCheck, updateOuvrageType);

// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, adminCheck, deleteOuvrageType);

export default router;
