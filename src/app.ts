import express from "express";
import path from "path";
import routes from "./Routes/index.routes";

const app = express();
const port = 9090;

// Middlewares globais
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Registo de todas as rotas
app.use(routes);

//Inicialização do servidor (SEMPRE no final)
app.listen(port, () => {
  console.log(`Servidor iniciado em: http://localhost:${port}`);
});