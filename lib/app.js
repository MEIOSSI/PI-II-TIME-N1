"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const index_routes_1 = __importDefault(require("./Routes/index.routes"));
const app = (0, express_1.default)();
const port = 9090;
// Middlewares globais
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// Registo de todas as rotas
app.use(index_routes_1.default);
//Inicialização do servidor (SEMPRE no final)
app.listen(port, () => {
    console.log(`Servidor iniciado em: http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map