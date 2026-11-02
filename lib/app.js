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
const auth_routes_1 = __importDefault(require("./Routes/auth.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
// Emulação de login: assume o líder cadastrado no projeto 1.
// Esta simulação não é ativada em produção.
app.use((req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV === "production") {
        return next();
    }
    try {
        const lideres = yield (0, db_1.executarConsulta)(`SELECT LIDER
             FROM pi2Projetos
             WHERE ID_PROJETO = :idProjeto
               AND ATIVO = 'S'`, { idProjeto: 1 });
        if (lideres.length > 0) {
            req.usuario = {
                id: Number(lideres[0].LIDER),
                papel: "LIDER"
            };
        }
    }
    catch (erro) {
        console.error("Erro ao simular login do líder do projeto 1:", erro);
    }
    next();
}));
app.get("/api/usuarios", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuarios = yield (0, db_1.executarConsulta)(`SELECT ID_USUARIO, NOME, EMAIL, PERFIL, ATIVO, DATA_CRIACAO
             FROM pi2Usuarios
             ORDER BY ID_USUARIO`);
        return res.json(usuarios);
    }
    catch (erro) {
        console.error("Erro ao consultar usuários:", erro);
        return res.status(500).json({
            erro: "Não foi possível consultar os usuários."
        });
    }
}));
app.get("/", (_req, res) => {
    return res.sendFile(path_1.default.join(__dirname, "../public/Views/login/tela-login/login.html"));
});
app.get("/cadastrar-usuario", (_req, res) => {
    return res.sendFile(path_1.default.join(__dirname, "../public/Views/login/tela-cadastro/cadastro.html"));
});
app.get("/projetos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const reqAutenticada = req;
    const usuarioId = (_a = reqAutenticada.usuario) === null || _a === void 0 ? void 0 : _a.id;
    if (!usuarioId) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
    }
    try {
        const projetos = yield (0, db_1.executarConsulta)(`SELECT
                p.ID_PROJETO,
                p.TITULO,
                COUNT(DISTINCT d.ID_DEMANDA) AS QUANTIDADE_DEMANDAS
             FROM pi2Projetos p
             LEFT JOIN pi2MembrosDosProjetos mp
                ON mp.PROJETO_ID = p.ID_PROJETO
             LEFT JOIN pi2Demandas d
                ON d.PROJETO_ID = p.ID_PROJETO
                AND d.RESPONSAVEL_ID = :usuarioId
                AND d.ATIVO = 'S'
                AND d.STATUS IN ('ABERTA', 'EM ANDAMENTO')
             WHERE (mp.USUARIO_ID = :usuarioId OR p.LIDER = :usuarioId)
               AND p.ATIVO = 'S'
             GROUP BY p.ID_PROJETO, p.TITULO
             ORDER BY p.TITULO`, { usuarioId });
        return res.json(projetos);
    }
    catch (erro) {
        console.error("Erro ao consultar projetos do usuário:", erro);
        return res.status(500).json({
            erro: "Não foi possível consultar os projetos."
        });
    }
}));
app.get("/projetos/:id/demandas", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idProjeto = Number(req.params.id);
    if (!Number.isInteger(idProjeto) || idProjeto <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
    }
    try {
        const demandas = yield (0, db_1.executarConsulta)(`SELECT
                d.ID_DEMANDA,
                d.TITULO,
                d.TIPO,
                d.PRIORIDADE,
                d.STATUS,
                u.NOME AS RESPONSAVEL
             FROM pi2Demandas d
             LEFT JOIN pi2Usuarios u
                ON d.RESPONSAVEL_ID = u.ID_USUARIO
             WHERE d.PROJETO_ID = :idProjeto
               AND d.ATIVO = 'S'
             ORDER BY d.ID_DEMANDA`, { idProjeto });
        const qntMembros = yield (0, db_1.executarConsulta)(`SELECT COUNT(*) AS QUANTIDADE_MEMBROS
             FROM pi2MembrosDosProjetos
             WHERE PROJETO_ID = :idProjeto`, { idProjeto });
        const nomeProjeto = yield (0, db_1.executarConsulta)(`SELECT TITULO AS NOME_PROJETO
             FROM pi2Projetos
             WHERE ID_PROJETO = :idProjeto`, { idProjeto });
        return res.status(200).json({
            demandas,
            qntMembros,
            nomeProjeto
        });
    }
    catch (erro) {
        console.error("Não foi possível acessar a tela de demandas.", erro);
        return res.status(500).json({
            erro: "Não foi possível consultar a tela de demandas."
        });
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
//# sourceMappingURL=app.js.map