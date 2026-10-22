import { Router } from "express";
import { getObjectiveById, getObjectives, createObjective, updateObjective, deleteObjective } from "./controller";
import { authCheck, adminCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";

const router = Router();
const Root = "/objectives";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, getObjectives);
router.get(`${Root}/:id`, authCheck, getObjectiveById);

// POST endpoints
router.post(`${Root}/`, authCheck, adminCheck, createObjective);

// PUT endpoints
router.put(`${Root}/:id`, authCheck, adminCheck, updateObjective);

// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, adminCheck, deleteObjective);

export default router;
