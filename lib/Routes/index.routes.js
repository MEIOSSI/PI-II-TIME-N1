"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Importar todas as rotas presentes para enviar de uma unica vez ao app.ts
const express_1 = require("express");
const demandas_routes_1 = __importDefault(require("./demandas.routes"));
const views_routes_1 = __importDefault(require("./views.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const router = (0, express_1.Router)();
// Rotas da API (retornam JSON)
router.use("/api", demandas_routes_1.default);
// Rotas visuais/páginas (retornam HTML)
router.use("/", views_routes_1.default);
// Rota validação senha
router.use("/api/auth", auth_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.routes.js.map