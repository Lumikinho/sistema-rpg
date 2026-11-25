import {Router} from "express";

import {gameSystemsController} from "../controllers/game-systems.controller.js";
import {autenticar} from "../middlewares/auth.middleware.js";

const gameSystemRoutes = Router();

gameSystemRoutes.use(autenticar);

gameSystemRoutes.get("/", gameSystemsController.listar);

export default gameSystemRoutes;
