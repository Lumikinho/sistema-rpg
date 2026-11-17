import "dotenv/config";
import express from "express";

import {connectDatabase} from "./config/prisma.js";
import {errorHandler} from "./middlewares/error.middleware.js";
import {routes} from "./routes/routes.js";

const app = express();
const port = process.env.SERVER_PORT;
const desenvolvimento = process.env.NODE_ENV;

app.use(express.json());
app.use("/", routes);
app.use(errorHandler);

await connectDatabase();

const server = app.listen(port, () => {
  console.log(
    `Servidor rodando em http://localhost:${port} (${desenvolvimento})`,
  );
});
