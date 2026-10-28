"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Ficheiros estáticos ou servir páginas HTML
router.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/Views/login/tela-login/login.html"));
});
router.get("/cadastrar-usuario", (req, res) => {
    console.log(path_1.default.join(__dirname, "../public/Views/login/tela-cadastro/cadastro.html"));
    res.sendFile(path_1.default.join(__dirname, "../public/Views/login/tela-cadastro/cadastro.html"));
});
exports.default = router;
//# sourceMappingURL=views.routes.js.map