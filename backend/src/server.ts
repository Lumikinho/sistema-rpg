import "dotenv/config";
import {connectDatabase} from "./config/prisma.js";
import express from "express";
import {routes} from "./routes/routes.js";
const app = express();
const port = process.env.SERVER_PORT;
const desenvolvimento = process.env.NODE_ENV;

app.use("/", routes);

await connectDatabase();

const server = app.listen(port, () => {
  console.log(
    `Servidor rodando em http://localhost:${port} (${desenvolvimento})`,
  );
});
