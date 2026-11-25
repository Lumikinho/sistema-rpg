import {Router} from "express";

import {authController} from "../controllers/auth.controller.js";
import {autenticar} from "../middlewares/auth.middleware.js";

const authRoutes = Router();

authRoutes.post("/login", authController.login);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/logout", authController.logout);

authRoutes.get("/me", autenticar, authController.me);

export default authRoutes;
