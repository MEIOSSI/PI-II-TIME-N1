"use strict";
//Este arquivo contém multiplos autores.
// verifique o autor  no topo de cada trecho.
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
const cadastro_routes_1 = __importDefault(require("./Routes/cadastro.routes"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const servidor = (0, node_http_1.createServer)(app); // -> transforma o app (que é um servidor express em http)
const io = new socket_io_1.Server(servidor); //-> usa esse servidor http para um servidor que é compativel com a biblioteca socket.io
function usuarioPodeAcessarDemanda(idDemanda, usuarioId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        var _b;
        const resultado = yield (0, db_1.executarConsulta)(`SELECT COUNT(*) AS PODE_ACESSAR
         FROM pi2Demandas d
         INNER JOIN pi2Projetos p
            ON p.ID_PROJETO = d.PROJETO_ID
           AND p.ATIVO = 'S'
         INNER JOIN pi2Usuarios u
            ON u.ID_USUARIO = :usuarioId
           AND u.ATIVO = 'S'
         WHERE d.ID_DEMANDA = :idDemanda
           AND d.ATIVO = 'S'
           AND (
                p.LIDER = :usuarioId
                OR u.PERFIL = 'ADMINISTRADOR'
                OR EXISTS (
                    SELECT 1
                    FROM pi2MembrosDosProjetos mp
                    WHERE mp.PROJETO_ID = p.ID_PROJETO
                      AND mp.USUARIO_ID = :usuarioId
                )
           )`, { idDemanda, usuarioId });
        return Number((_b = (_a = resultado[0]) === null || _a === void 0 ? void 0 : _a.PODE_ACESSAR) !== null && _b !== void 0 ? _b : 0) > 0;
    });
}
io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV === "production") {
        return next(new Error("Autenticação não configurada."));
    }
    try {
        const lideres = yield (0, db_1.executarConsulta)(`SELECT LIDER
             FROM pi2Projetos
             WHERE ID_PROJETO = :idProjeto
               AND ATIVO = 'S'`, { idProjeto: 1 });
        if (lideres.length === 0) {
            return next(new Error("Usuário simulado não encontrado."));
        }
        socket.data.usuario = {
            id: Number(lideres[0].LIDER),
            papel: "LIDER"
        };
        next();
    }
    catch (erro) {
        next(erro instanceof Error ? erro : new Error("Falha na autenticação."));
    }
}));
io.on("connection", (socket) => {
    socket.on("entrar-demanda", (idRecebido, responder) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const responderAck = typeof responder === "function" ? responder : undefined;
        const idDemanda = Number(idRecebido);
        const usuarioId = Number((_a = socket.data.usuario) === null || _a === void 0 ? void 0 : _a.id);
        if (!Number.isInteger(idDemanda) || idDemanda <= 0) {
            responderAck === null || responderAck === void 0 ? void 0 : responderAck({ ok: false, erro: "ID da demanda inválido." });
            return;
        }
        try {
            if (!(yield usuarioPodeAcessarDemanda(idDemanda, usuarioId))) {
                responderAck === null || responderAck === void 0 ? void 0 : responderAck({ ok: false, erro: "Você não participa desta demanda." });
                return;
            }
            yield socket.join(`demanda:${idDemanda}`);
            responderAck === null || responderAck === void 0 ? void 0 : responderAck({ ok: true });
        }
        catch (erro) {
            console.error("Erro ao autorizar entrada na sala da demanda:", erro);
            responderAck === null || responderAck === void 0 ? void 0 : responderAck({ ok: false, erro: "Não foi possível entrar na sala da demanda." });
        }
    }));
    socket.on("novo-comentario", (dados, responder) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const responderAck = typeof responder === "function" ? responder : undefined;
        const responderErro = (erro) => responderAck === null || responderAck === void 0 ? void 0 : responderAck({ ok: false, erro });
        if (typeof dados !== "object" || dados === null) {
            responderErro("Dados do comentário inválidos.");
            return;
        }
        const comentario = dados;
        const idDemanda = Number(comentario.idDemanda);
        const usuarioId = Number((_a = socket.data.usuario) === null || _a === void 0 ? void 0 : _a.id);
        const texto = typeof comentario.texto === "string"
            ? comentario.texto.trim()
            : "";
        if (!Number.isInteger(idDemanda) || idDemanda <= 0 || !texto) {
            responderErro("Informe um comentário válido.");
            return;
        }
        const salaDemanda = `demanda:${idDemanda}`;
        if (!socket.rooms.has(salaDemanda)) {
            responderErro("Entre na sala da demanda antes de comentar.");
            return;
        }
        try {
            if (!(yield usuarioPodeAcessarDemanda(idDemanda, usuarioId))) {
                responderErro("Você não participa desta demanda.");
                return;
            }
            yield (0, db_1.executarComando)(`INSERT INTO pi2Comentarios (demanda_id, usuario_id, texto)
                 VALUES (:idDemanda, :usuarioId, :texto)`, { idDemanda, usuarioId, texto });
            io.to(salaDemanda).emit("comentario-criado", {
                idDemanda,
                usuarioId,
                texto
            });
            responderAck === null || responderAck === void 0 ? void 0 : responderAck({ ok: true });
        }
        catch (erro) {
            console.error("Erro ao salvar comentário:", erro);
            responderErro("Não foi possível salvar o comentário. Tente novamente.");
        }
    })); // evento de publicar o comentário
}); // inicia o servidor socket.io
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.get("/detalhes/:id", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/Views/detalhesDemanda/detalhesDemanda.html"));
});
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
app.get("/demandas", (_req, res) => {
    return res.sendFile(path_1.default.join(__dirname, "../public/Views/telaDemandas/demandas.html"));
});
app.get("/dashboard", (_req, res) => {
    return res.sendFile(path_1.default.join(__dirname, "../public/Views/dashboard/dashboard.html"));
});
app.get("/view/projetos", (_req, res) => {
    return res.sendFile(path_1.default.join(__dirname, "../public/Views/telaProjetos/projetos.html"));
});
//rota do cadastro de demandas
//por Leticya Fernandes - 26896423
app.use("/api/demandas", cadastro_routes_1.default);
//rota da tela de projetos
//por Valentina Bastos - 26893594
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
        const usuarios = yield (0, db_1.executarConsulta)(`SELECT ID_USUARIO, NOME, PERFIL
            FROM pi2Usuarios
            WHERE ID_USUARIO = :usuarioId`, { usuarioId });
        if (usuarios.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }
        return res.json({
            usuario: usuarios[0],
            projetos
        });
    }
    catch (erro) {
        console.error("Erro ao consultar projetos do usuário:", erro);
        return res.status(500).json({
            erro: "Não foi possível consultar os projetos."
        });
    }
}));
//rota da tela de demandas
//por Valentina Bastos - 26893594
app.get("/projetos/:id/demandas", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    var _b, _c, _d;
    const idProjeto = Number(req.params.id);
    const prioridade = String((_b = req.query.prioridade) !== null && _b !== void 0 ? _b : "");
    const tipo = String((_c = req.query.tipo) !== null && _c !== void 0 ? _c : "");
    const apenasMinhasDemandas = req.query.apenasMinhasDemandas === "true";
    const pesquisa = String((_d = req.query.pesquisa) !== null && _d !== void 0 ? _d : "").trim();
    if (!Number.isInteger(idProjeto) || idProjeto <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
    }
    const reqAutenticada = req;
    const usuarioId = (_a = reqAutenticada.usuario) === null || _a === void 0 ? void 0 : _a.id;
    if (!usuarioId) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
    }
    try {
        let sql = `SELECT
            d.ID_DEMANDA,
            d.TITULO,
            d.TIPO,
            d.PRIORIDADE,
            d.STATUS,
            d.RESPONSAVEL_ID,
            u.NOME AS RESPONSAVEL
        FROM pi2Demandas d
        LEFT JOIN pi2Usuarios u
            ON d.RESPONSAVEL_ID = u.ID_USUARIO
        WHERE d.PROJETO_ID = :idProjeto
        AND d.ATIVO = 'S'`;
        const parametros = { idProjeto };
        if (prioridade) {
            sql += " AND d.PRIORIDADE = :prioridade";
            parametros.prioridade = prioridade;
        }
        if (tipo) {
            sql += " AND d.TIPO = :tipo";
            parametros.tipo = tipo;
        }
        if (apenasMinhasDemandas) {
            sql += " AND d.RESPONSAVEL_ID = :usuarioId";
            parametros.usuarioId = usuarioId;
        }
        if (pesquisa) {
            sql += " AND UPPER(d.TITULO) LIKE :pesquisa";
            parametros.pesquisa = `%${pesquisa.toUpperCase()}%`;
        }
        sql += " ORDER BY d.ID_DEMANDA";
        const usuarios = yield (0, db_1.executarConsulta)(`SELECT ID_USUARIO, NOME, PERFIL
            FROM pi2Usuarios
            WHERE ID_USUARIO = :usuarioId`, { usuarioId });
        const nomeProjeto = yield (0, db_1.executarConsulta)(`SELECT TITULO
             FROM pi2Projetos
             WHERE ID_PROJETO = :idProjeto`, { idProjeto });
        const demandas = yield (0, db_1.executarConsulta)(sql, parametros);
        return res.status(200).json({
            demandas,
            usuario: usuarios[0],
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
//rotas detalhes de demanda
//por Murilo Lopes - 26894964
app.get("/demanda/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const idDemanda = Number(req.params.id);
        if (!Number.isInteger(idDemanda) || idDemanda <= 0) {
            return res.status(400).json({ msg: "ID é inválido." });
        }
        const detalhesDemanda = yield (0, db_1.executarConsulta)(`SELECT
            pi2Demandas.*,
            FROM_TZ(CAST(pi2Demandas.DATA_CRIACAO AS TIMESTAMP), 'UTC') AS DATA_CRIACAO_UTC,
            FROM_TZ(CAST(pi2Demandas.DATA_ATUALIZACAO AS TIMESTAMP), 'UTC') AS DATA_ATUALIZACAO_UTC,
            pi2Projetos.TITULO AS NOME_PROJETO,
            pi2Usuarios.NOME AS NOME_RESPONSAVEL
         FROM pi2Demandas
         INNER JOIN pi2Projetos
            ON pi2Demandas.PROJETO_ID = pi2Projetos.ID_PROJETO
         LEFT JOIN pi2Usuarios
            ON pi2Demandas.RESPONSAVEL_ID = pi2Usuarios.ID_USUARIO
         WHERE pi2Demandas.ID_DEMANDA = :id
           AND pi2Demandas.ATIVO = 'S'`, { id: idDemanda });
        const usuarioId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.id;
        if (detalhesDemanda.length > 0 && usuarioId) {
            const usuarioEpapel = yield (0, db_1.executarConsulta)(`SELECT
                (SELECT pi2Usuarios.NOME
                 FROM pi2Usuarios
                 WHERE pi2Usuarios.ID_USUARIO = :usuarioId) AS NOME_USUARIO_LOGADO,
                (SELECT pi2Usuarios.PERFIL
                 FROM pi2Usuarios
                 WHERE pi2Usuarios.ID_USUARIO = :usuarioId) AS PERFIL_USUARIO_LOGADO,
                (SELECT pi2Usuarios.ID_USUARIO
                 FROM pi2Usuarios
                 WHERE pi2Usuarios.ID_USUARIO = :usuarioId) AS ID_USUARIO_LOGADO,
                CASE
                    WHEN pi2Projetos.LIDER = :usuarioId THEN 'LIDER'
                    ELSE (
                        SELECT pi2MembrosDosProjetos.PAPEL_NO_PROJETO
                        FROM pi2MembrosDosProjetos
                        WHERE pi2MembrosDosProjetos.PROJETO_ID = pi2Demandas.PROJETO_ID
                          AND pi2MembrosDosProjetos.USUARIO_ID = :usuarioId
                    )
                END AS PAPEL_USUARIO_PROJETO
             FROM pi2Demandas
             INNER JOIN pi2Projetos
                ON pi2Demandas.PROJETO_ID = pi2Projetos.ID_PROJETO
             WHERE pi2Demandas.ID_DEMANDA = :id`, { usuarioId, id: idDemanda });
            if (usuarioEpapel.length > 0) {
                Object.assign(detalhesDemanda[0], usuarioEpapel[0]);
            }
        }
        return res.json(detalhesDemanda);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao buscar a demanda." });
    }
}));
//por Murilo Lopes - 26894964
app.put("/demanda/:id/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    var _c;
    const id = Number(req.params.id);
    const usuarioId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.id;
    const statusNovo = String((_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.status) !== null && _c !== void 0 ? _c : "").trim().toUpperCase();
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID da demanda inválido." });
    }
    if (!usuarioId) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
    }
    const proximoStatus = {
        ABERTA: "EM ANDAMENTO",
        "EM ANDAMENTO": "EM REVISAO",
        "EM REVISAO": "CONCLUIDA"
    };
    try {
        const resultado = yield (0, db_1.executarConsulta)(`SELECT
                pi2Demandas.STATUS,
                pi2Demandas.RESPONSAVEL_ID,
                pi2Projetos.LIDER,
                pi2MembrosDosProjetos.PAPEL_NO_PROJETO,
                (SELECT pi2Usuarios.PERFIL
                 FROM pi2Usuarios
                 WHERE pi2Usuarios.ID_USUARIO = :usuarioId) AS PERFIL_USUARIO_LOGADO
             FROM pi2Demandas
             INNER JOIN pi2Projetos
                ON pi2Demandas.PROJETO_ID = pi2Projetos.ID_PROJETO
             LEFT JOIN pi2MembrosDosProjetos
                ON pi2MembrosDosProjetos.PROJETO_ID = pi2Demandas.PROJETO_ID
                AND pi2MembrosDosProjetos.USUARIO_ID = :usuarioId
             WHERE pi2Demandas.ID_DEMANDA = :id
                AND pi2Demandas.ATIVO = 'S'`, { id, usuarioId });
        if (resultado.length === 0) {
            return res.status(404).json({ erro: "Demanda não encontrada." });
        }
        const demanda = resultado[0];
        const statusAtual = demanda.STATUS.trim().toUpperCase();
        const ehLider = Number(demanda.LIDER) === usuarioId;
        const ehMembro = demanda.PAPEL_NO_PROJETO === "MEMBRO_DA_EQUIPE";
        const ehAdministrador = demanda.PERFIL_USUARIO_LOGADO === "ADMINISTRADOR";
        if (!ehLider && !ehMembro && !ehAdministrador) {
            return res.status(403).json({ erro: "Você não participa deste projeto." });
        }
        if (statusNovo === "CANCELADA") {
            if (!ehLider && !ehAdministrador) {
                return res.status(403).json({
                    erro: "Somente o líder do projeto ou o administrador pode cancelar a demanda."
                });
            }
            if (statusAtual === "CONCLUIDA" || statusAtual === "CANCELADA") {
                return res.status(400).json({
                    erro: "Esta demanda não pode ser cancelada."
                });
            }
        }
        else if (statusNovo === "ABERTA" && (statusAtual === "CONCLUIDA" || statusAtual === "CANCELADA")) {
            if (!ehLider && !ehAdministrador) {
                return res.status(403).json({
                    erro: "Somente o líder do projeto ou o administrador pode reabrir a demanda."
                });
            }
        }
        else if (statusAtual === "EM REVISAO" && statusNovo === "EM ANDAMENTO") {
            if (!ehLider && !ehAdministrador) {
                return res.status(403).json({
                    erro: "Somente o líder do projeto ou o administrador pode devolver a demanda para andamento."
                });
            }
        }
        else if (proximoStatus[statusAtual] !== statusNovo) {
            return res.status(400).json({ erro: "Transição de status inválida." });
        }
        const transicaoDoResponsavel = (statusAtual === "ABERTA" && statusNovo === "EM ANDAMENTO") ||
            (statusAtual === "EM ANDAMENTO" && statusNovo === "EM REVISAO");
        if (transicaoDoResponsavel
            && Number(demanda.RESPONSAVEL_ID) !== usuarioId
            && !ehLider
            && !ehAdministrador) {
            return res.status(403).json({
                erro: "Somente o responsável, o líder do projeto ou o administrador pode avançar o status."
            });
        }
        if (statusAtual === "EM REVISAO" && statusNovo === "CONCLUIDA" && !ehLider && !ehAdministrador) {
            return res.status(403).json({
                erro: "Somente o líder do projeto ou o administrador pode concluir a demanda."
            });
        }
        yield (0, db_1.executarComando)(`BEGIN
                UPDATE pi2Demandas
                SET STATUS = :statusNovo,
                    DATA_ATUALIZACAO = SYSTIMESTAMP
                WHERE ID_DEMANDA = :id
                  AND STATUS = :statusAtual
                  AND ATIVO = 'S';

                IF SQL%ROWCOUNT = 0 THEN
                    RAISE_APPLICATION_ERROR(-20001, 'O status foi alterado.');
                END IF;

                INSERT INTO pi2HistoricosDeDemandas
                    (DEMANDA_ID, USUARIO_ID, CAMPO_ALTERADO, VALOR_ANTERIOR, VALOR_NOVO)
                VALUES
                    (:id, :usuarioId, 'status', :statusAtual, :statusNovo);
             END;`, { id, usuarioId, statusAtual, statusNovo });
        return res.json({ mensagem: "Status atualizado.", status: statusNovo });
    }
    catch (error) {
        if (error.errorNum === 20001) {
            return res.status(409).json({ erro: "O status mudou. Atualize a página." });
        }
        console.error("Erro ao atualizar status:", error);
        return res.status(500).json({ erro: "Não foi possível atualizar o status." });
    }
}));
//por Murilo Lopes - 26894964
app.get("/demanda/:id/comentarios", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const idDemanda = Number(req.params.id);
    const usuarioId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.id;
    if (!Number.isInteger(idDemanda) || idDemanda <= 0) {
        return res.status(400).json({ erro: "ID da demanda inválido." });
    }
    if (!usuarioId) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
    }
    try {
        if (!(yield usuarioPodeAcessarDemanda(idDemanda, usuarioId))) {
            return res.status(403).json({ erro: "Você não participa desta demanda." });
        }
        const comentarios = yield (0, db_1.executarConsulta)(`SELECT
                c.ID_COMENTARIO,
                c.DEMANDA_ID,
                c.USUARIO_ID,
                u.NOME AS NOME_USUARIO,
                c.TEXTO,
                FROM_TZ(CAST(c.DATA_CRIACAO AS TIMESTAMP), 'UTC') AS DATA_CRIACAO
             FROM pi2Comentarios c
             INNER JOIN pi2Usuarios u
                ON u.ID_USUARIO = c.USUARIO_ID
             WHERE c.DEMANDA_ID = :idDemanda
             ORDER BY c.DATA_CRIACAO ASC, c.ID_COMENTARIO ASC`, { idDemanda });
        return res.json(comentarios);
    }
    catch (erro) {
        console.error("Erro ao buscar comentários da demanda:", erro);
        return res.status(500).json({ erro: "Não foi possível carregar os comentários." });
    }
}));
//por Murilo Lopes - 26894964
app.get("/demanda/:id/historico", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idDemanda = Number(req.params.id);
    if (!Number.isInteger(idDemanda) || idDemanda <= 0) {
        return res.status(400).json({ msg: "ID é inválido." });
    }
    try {
        const historico = yield (0, db_1.executarConsulta)(`SELECT
                pi2HistoricosDeDemandas.CAMPO_ALTERADO,
                pi2HistoricosDeDemandas.VALOR_ANTERIOR,
                pi2HistoricosDeDemandas.VALOR_NOVO,
                FROM_TZ(CAST(pi2HistoricosDeDemandas.DATA_ALTERACAO AS TIMESTAMP), 'UTC') AS DATA_ALTERACAO,
                pi2Usuarios.NOME AS NOME_USUARIO
             FROM pi2HistoricosDeDemandas
             INNER JOIN pi2Usuarios
                ON pi2HistoricosDeDemandas.USUARIO_ID = pi2Usuarios.ID_USUARIO
             WHERE pi2HistoricosDeDemandas.DEMANDA_ID = :id
             ORDER BY pi2HistoricosDeDemandas.DATA_ALTERACAO ASC`, { id: idDemanda });
        return res.json(historico);
    }
    catch (error) {
        console.error("Erro ao buscar histórico da demanda:", error);
        return res.status(500).json({ erro: "Erro ao buscar o histórico da demanda." });
    }
}));
//por Murilo Lopes - 26894964
function iniciarServidor() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, db_1.conectarBanco)();
            servidor.listen(PORT, () => {
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