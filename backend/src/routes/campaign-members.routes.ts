import {Router} from "express";

import {campaignMembersController} from "../controllers/campaign-members.controller.js";
import {autenticar} from "../middlewares/auth.middleware.js";

const campaignMemberRoutes = Router({mergeParams: true});

campaignMemberRoutes.use(autenticar);

campaignMemberRoutes.get("/", campaignMembersController.listar);
campaignMemberRoutes.post("/", campaignMembersController.adicionar);
campaignMemberRoutes.patch("/:memberId", campaignMembersController.atualizar);
campaignMemberRoutes.delete("/:memberId", campaignMembersController.remover);

export default campaignMemberRoutes;
