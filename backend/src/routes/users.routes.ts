import {Router} from "express";

import {usersController} from "../controllers/users.controller.js";
import {
  autenticar,
  exigirProprioOuRole,
  exigirRole,
} from "../middlewares/auth.middleware.js";

const userRoutes = Router();

userRoutes.post("/", usersController.criar);

userRoutes.use(autenticar);

userRoutes.get("/search", usersController.buscar);
userRoutes.get("/profile", usersController.perfil);
userRoutes.patch("/profile", usersController.atualizar);
userRoutes.put("/profile", usersController.atualizar);

userRoutes.get("/", exigirRole("MASTER"), usersController.listar);
userRoutes.get("/:id", exigirProprioOuRole("MASTER"), usersController.buscarPorId);

userRoutes.put("/:id", exigirProprioOuRole("MASTER"), usersController.atualizar);

userRoutes.delete(
  "/:id",
  exigirProprioOuRole("MASTER"),
  usersController.excluir,
);

export default userRoutes;
