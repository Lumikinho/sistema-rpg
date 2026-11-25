import {Router} from "express";

import {campaignsController} from "../controllers/campaigns.controller.js";
import {autenticar} from "../middlewares/auth.middleware.js";
import campaignMemberRoutes from "./campaign-members.routes.js";
import characterRoutes from "./characters.routes.js";
import templateRoutes from "./templates.routes.js";

const campaignRoutes = Router();

campaignRoutes.use(autenticar);

campaignRoutes.get("/", campaignsController.listar);
campaignRoutes.post("/", campaignsController.criar);
campaignRoutes.get("/:id", campaignsController.buscarPorId);

campaignRoutes.use("/:campaignId/members", campaignMemberRoutes);
campaignRoutes.use("/:campaignId/characters", characterRoutes);
campaignRoutes.use("/:campaignId/templates", templateRoutes);

export default campaignRoutes;
