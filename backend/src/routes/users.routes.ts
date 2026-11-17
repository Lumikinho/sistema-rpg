import {Router} from "express";

import {usersController} from "../controllers/users.controller.js";

const userRoutes = Router();

userRoutes.get("/", usersController.listar);
userRoutes.get("/:id", usersController.buscarPorId);

userRoutes.post("/", usersController.criar);

userRoutes.put("/:id", usersController.atualizar);

userRoutes.delete("/:id", usersController.excluir);

export default userRoutes;
