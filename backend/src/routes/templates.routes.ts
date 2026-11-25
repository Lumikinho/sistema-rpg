import {Router} from "express";

import {templatesController} from "../controllers/templates.controller.js";
import {autenticar} from "../middlewares/auth.middleware.js";

const templateRoutes = Router({mergeParams: true});

templateRoutes.use(autenticar);

templateRoutes.get("/", templatesController.buscarOuCriar);

export default templateRoutes;
