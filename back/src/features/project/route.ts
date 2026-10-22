import { Router } from "express";
import { getProjectById, getProjects, createProject, updateProject, deleteProject, convertToOds } from "./controller";
import { authCheck, adminCheck } from "../../middlewares/auth";
import { cleanQuery } from "../../middlewares/request";
import { limitationMiddleware } from "../../middlewares/limitation";
import { scopeById } from "../../utils/access";
import { ProjectModel } from "./model";

const router = Router();
const Root = "/projects";

// GET endpoints
router.get(`${Root}/`, authCheck, cleanQuery, limitationMiddleware, getProjects);
router.get(`${Root}/:id`, authCheck, scopeById(ProjectModel), getProjectById);

// POST endpoints
router.post(`${Root}/`, authCheck, createProject);
// PUT endpoints
router.put(`${Root}/:id`, authCheck, scopeById(ProjectModel), updateProject);

// PATCH endpoints
router.patch(`${Root}/:id/convert-to-ods`, authCheck, scopeById(ProjectModel), convertToOds);

// DELETE endpoints
router.delete(`${Root}/:id`, authCheck, scopeById(ProjectModel), deleteProject);

export default router;
