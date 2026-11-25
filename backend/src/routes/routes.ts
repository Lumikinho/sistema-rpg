import {Router} from "express";

import authRoutes from "./auth.routes.js";
import campaignRoutes from "./campaigns.routes.js";
import gameSystemRoutes from "./game-systems.routes.js";
import userRoutes from "./users.routes.js";

export const routes = Router();
routes.use("/auth", authRoutes);
routes.use("/users", userRoutes);
routes.use("/campaigns", campaignRoutes);
routes.use("/game-systems", gameSystemRoutes);

routes.get("/health", (_req, res) => {
  res.json({status: "ok", uptime: process.uptime()});
});
