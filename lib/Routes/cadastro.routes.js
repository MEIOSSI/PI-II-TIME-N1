"use strict";
// Autor: Leticya
// RA: 26896423
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// rota do cadastro de demandas
const express_1 = require("express");
const executar_1 = require("../Database/executar");
// mini-servidor só pro cadastro, o app.ts que liga ele lá
const router = (0, express_1.Router)();
const tipoParaBanco = {
    "Tarefa": "TAREFA",
    "Defeito": "DEFEITO",
    "Melhoria": "MELHORIA",
    "Documentação": "DOCUMENTACAO"
};
const tipoParaTela = {
    "TAREFA": "Tarefa",
    "DEFEITO": "Defeito",
    "MELHORIA": "Melhoria",
    "DOCUMENTACAO": "Documentação"
};
const prioridadeParaBanco = {
    "Crítica": "CRITICA",
    "Alta": "ALTA",
    "Média": "MEDIA",
    "Baixa": "BAIXA"
};
const prioridadeParaTela = {
    "CRITICA": "Crítica",
    "ALTA": "Alta",
    "MEDIA": "Média",
    "BAIXA": "Baixa"
};
const statusParaTela = {
    "ABERTA": "Aberta",
    "EM ANDAMENTO": "Em andamento",
    "EM REVISAO": "Em revisão",
    "CONCLUIDA": "Concluída",
    "CANCELADA": "Cancelada"
};
// o que o servidor aceita, se vier outra coisa leva 400
const tiposValidos = Object.keys(tipoParaBanco);
const prioridadesValidas = Object.keys(prioridadeParaBanco);
//pgt p api de feriados se a data é feriado nacional
function ehFeriado(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // a data vem como AAAA-MM-DD, então o ano são os 4 primeiros caracteres
        const ano = data.substring(0, 4);
        const resposta = yield fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
        if (!resposta.ok) {
            throw new Error("API de feriados fora do ar");
        }
        const feriados = yield resposta.json();
        // true se algum feriado tem a mesma data
        return feriados.some((feriado) => feriado.date === data);
    });
}
// confere o prazo -o prazo é opcional, mas se vier não pode ser data errada nem feriado-
// devolve o erro {codigo, mensagem}, ou null se tá tudo certo
function validarPrazo(prazo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isNaN(Date.parse(prazo))) {
            return { codigo: 400, mensagem: "Prazo inválido." };
        }
        try {
            if (yield ehFeriado(prazo)) {
                return { codigo: 400, mensagem: "O prazo não pode ser em um feriado nacional." };
            }
        }
        catch (erro) {
            // a API de fora não respondeu, então não dá p/ saber se é feriado
            return { codigo: 502, mensagem: "Não foi possível verificar se o prazo é feriado. Tente de novo." };
        }
        return null;
    });
}
// busca uma demanda no banco pelo id (devolve a linha do banco ou null se não existir)
// o prazo já volta como texto AAAA-MM-DD, igual o input de data da tela usa
function buscarDemanda(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const resultado = yield (0, executar_1.executar)(`SELECT ID_DEMANDA, TITULO, DESCRICAO, TIPO, PRIORIDADE, STATUS,
                TO_CHAR(PRAZO_FINAL, 'YYYY-MM-DD') AS PRAZO_FINAL,
                PROJETO_ID, DATA_CRIACAO, DATA_ATUALIZACAO
         FROM pi2Demandas
         WHERE ID_DEMANDA = :id
           AND ATIVO = 'S'`, { id });
        return resultado.rows.length > 0 ? resultado.rows[0] : null;
    });
}
// transforma a linha do banco (COLUNAS_EM_MAIUSCULO) no JSON que a tela já espera
function linhaParaDemanda(linha) {
    return {
        id: linha.ID_DEMANDA,
        titulo: linha.TITULO,
        descricao: linha.DESCRICAO,
        tipo: tipoParaTela[linha.TIPO],
        prioridade: prioridadeParaTela[linha.PRIORIDADE],
        status: statusParaTela[linha.STATUS],
        projetoId: linha.PROJETO_ID,
        prazo: linha.PRAZO_FINAL,
        dataCriacao: linha.DATA_CRIACAO,
        dataAtualizacao: linha.DATA_ATUALIZACAO
    };
}
// grava uma linha no histórico: quem mudou, qual campo, valor antigo e valor novo
function registrarHistorico(demandaId, usuarioId, campo, valorAntes, valorNovo) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, executar_1.executar)(`INSERT INTO pi2HistoricosDeDemandas
            (DEMANDA_ID, USUARIO_ID, CAMPO_ALTERADO, VALOR_ANTERIOR, VALOR_NOVO, DATA_ALTERACAO)
         VALUES
            (:demandaId, :usuarioId, :campo, :valorAntes, :valorNovo, SYSTIMESTAMP)`, { demandaId, usuarioId, campo, valorAntes, valorNovo });
    });
}
//rotas
// POST /api/demandas -quando clica em CADASTRAR na tela-
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // o app.ts simula o login e deixa o usuário em req.usuario
    // a coluna CRIADO_POR do banco é obrigatória, então quem cria é quem está logado
    // quem está logado é quem faz a alteração (vai pro histórico)
    const usuarioId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.id;
    if (!usuarioId) {
        res.status(401).json({ mensagem: "Usuário não autenticado." });
        return;
    }
    // desmonta o que a tela mandou, cada campo vira uma variável
    const { titulo, descricao, tipo, prioridade, projetoId, prazo } = req.body;
    // se faltar algo obrigatório já devolve 400 e para por aqui
    if (!titulo || !descricao || !tipo || !prioridade || !projetoId) {
        res.status(400).json({ mensagem: "Título, descrição, tipo, prioridade e projeto são obrigatórios." });
        return;
    }
    // confere se o tipo e a prioridade são dos que existem mesmo
    if (!tiposValidos.includes(tipo) || !prioridadesValidas.includes(prioridade)) {
        res.status(400).json({ mensagem: "Tipo ou prioridade inválidos." });
        return;
    }
    // se mandou prazo, confere se é uma data certa e se não cai em feriado
    if (prazo) {
        const erroPrazo = yield validarPrazo(prazo);
        if (erroPrazo) {
            res.status(erroPrazo.codigo).json({ mensagem: erroPrazo.mensagem });
            return;
        }
    }
    try {
        // INSERT: status (ABERTA) e as datas não são enviados,
        // quem decide isso é o próprio banco (DEFAULT da tabela), a pessoa n preenche
        // RETURNING devolve o id que o banco gerou
        const resultado = yield (0, executar_1.executar)(`INSERT INTO pi2Demandas
                (TITULO, DESCRICAO, TIPO, PRIORIDADE, PRAZO_FINAL, PROJETO_ID, CRIADO_POR)
             VALUES
                (:titulo, :descricao, :tipo, :prioridade,
                 TO_DATE(:prazo, 'YYYY-MM-DD'), :projetoId, :criadoPor)
             RETURNING ID_DEMANDA INTO :novoId`, {
            titulo,
            descricao,
            tipo: tipoParaBanco[tipo],
            prioridade: prioridadeParaBanco[prioridade],
            prazo: prazo || null,
            projetoId: Number(projetoId),
            criadoPor: usuarioId,
            novoId: { dir: executar_1.BIND_OUT, type: executar_1.TIPO_NUMERO }
        });
        const novoId = resultado.outBinds.novoId[0];
        const novaDemanda = yield buscarDemanda(novoId);
        // 201 = criou certinho
        res.status(201).json(linhaParaDemanda(novaDemanda));
    }
    catch (erro) {
        console.error("Erro ao cadastrar demanda:", erro);
        res.status(500).json({ mensagem: "Não foi possível cadastrar a demanda." });
    }
}));
// GET /api/demandas/:id -busca uma demanda, a tela de edição usa p/ preencher o formulário-
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    try {
        const demanda = yield buscarDemanda(id);
        // se não achou a demanda com esse id, devolve 404
        if (!demanda) {
            res.status(404).json({ mensagem: "Demanda não encontrada." });
            return;
        }
        res.status(200).json(linhaParaDemanda(demanda));
    }
    catch (erro) {
        console.error("Erro ao buscar demanda:", erro);
        res.status(500).json({ mensagem: "Não foi possível consultar a demanda." });
    }
}));
// PUT /api/demandas/:id -atualiza uma demanda, a tela usa quando está editando-
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = Number(req.params.id);
    // quem está logado é quem faz a alteração (vai pro histórico)
    const usuarioId = (_a = req.usuario) === null || _a === void 0 ? void 0 : _a.id;
    if (!usuarioId) {
        res.status(401).json({ mensagem: "Usuário não autenticado." });
        return;
    }
    const { titulo, descricao, tipo, prioridade, projetoId, prazo } = req.body;
    // mesmas validações do cadastro
    if (!titulo || !descricao || !tipo || !prioridade || !projetoId) {
        res.status(400).json({ mensagem: "Título, descrição, tipo, prioridade e projeto são obrigatórios." });
        return;
    }
    if (!tiposValidos.includes(tipo) || !prioridadesValidas.includes(prioridade)) {
        res.status(400).json({ mensagem: "Tipo ou prioridade inválidos." });
        return;
    }
    // o feriado também vale na edição
    if (prazo) {
        const erroPrazo = yield validarPrazo(prazo);
        if (erroPrazo) {
            res.status(erroPrazo.codigo).json({ mensagem: erroPrazo.mensagem });
            return;
        }
    }
    try {
        // guarda como a demanda estava ANTES de editar, pra comparar depois
        const antes = yield buscarDemanda(id);
        if (!antes) {
            res.status(404).json({ mensagem: "Demanda não encontrada." });
            return;
        }
        const resultado = yield (0, executar_1.executar)(`UPDATE pi2Demandas
             SET TITULO = :titulo,
                 DESCRICAO = :descricao,
                 TIPO = :tipo,
                 PRIORIDADE = :prioridade,
                 PRAZO_FINAL = TO_DATE(:prazo, 'YYYY-MM-DD'),
                 PROJETO_ID = :projetoId,
                 DATA_ATUALIZACAO = SYSTIMESTAMP
             WHERE ID_DEMANDA = :id
               AND ATIVO = 'S'`, {
            titulo,
            descricao,
            tipo: tipoParaBanco[tipo],
            prioridade: prioridadeParaBanco[prioridade],
            prazo: prazo || null,
            projetoId: Number(projetoId),
            id
        });
        if (resultado.rowsAffected === 0) {
            res.status(404).json({ mensagem: "Demanda não encontrada." });
            return;
        }
        // busca de novo para devolver já com a data de atualização nova
        const demanda = yield buscarDemanda(id);
        res.status(200).json(linhaParaDemanda(demanda));
    }
    catch (erro) {
        console.error("Erro ao atualizar demanda:", erro);
        res.status(500).json({ mensagem: "Não foi possível atualizar a demanda." });
    }
}));
exports.default = router;
//# sourceMappingURL=cadastro.routes.js.map