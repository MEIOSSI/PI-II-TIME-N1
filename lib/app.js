"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const db_1 = require("./Database/db");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.get("/api/usuarios", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuarios = yield (0, db_1.executarConsulta)(`SELECT ID_USUARIO, NOME, EMAIL, PERFIL, ATIVO, DATA_CRIACAO
             FROM pi2Usuarios
             ORDER BY ID_USUARIO`);
        res.json(usuarios);
    }
    catch (erro) {
        console.error("Erro ao consultar usuários:", erro);
        res.status(500).json({ erro: "Não foi possível consultar os usuários." });
    }
}));
function iniciarServidor() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, db_1.conectarBanco)();
            app.listen(PORT, () => {
                console.log(`Servidor iniciado em http://localhost:${PORT}`);
            });
        }
        catch (erro) {
            console.error("Erro ao iniciar a aplicação:", erro);
            process.exit(1);
        }
    });
}
iniciarServidor();
//rotas
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../public/Views/login/tela-login/login.html"));
});
app.get("/cadastrar-usuario", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../public/Views/login/tela-cadastro/cadastro.html"));
});
//# sourceMappingURL=app.js.map