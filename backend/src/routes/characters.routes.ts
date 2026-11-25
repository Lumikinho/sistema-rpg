import {Router} from "express";

import {charactersController} from "../controllers/characters.controller.js";
import {autenticar} from "../middlewares/auth.middleware.js";

const characterRoutes = Router({mergeParams: true});

characterRoutes.use(autenticar);

characterRoutes.get("/", charactersController.listar);
characterRoutes.post("/", charactersController.criar);
characterRoutes.get("/:characterId", charactersController.buscarPorId);
characterRoutes.put("/:characterId", charactersController.atualizar);
characterRoutes.patch("/:characterId", charactersController.atualizar);
characterRoutes.delete("/:characterId", charactersController.excluir);
characterRoutes.post("/:characterId/assign", charactersController.atribuir);

export default characterRoutes;
