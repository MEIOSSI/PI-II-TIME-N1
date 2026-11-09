// Autor: Leticya
// RA: 26896423

// rota do cadastro de demandas
import { Router, Request, Response } from "express";
import { executar, BIND_OUT, TIPO_NUMERO } from "../Database/executar";

// mini-servidor só pro cadastro, o app.ts que liga ele lá
const router = Router();

const tipoParaBanco: Record<string, string> = {
    "Tarefa": "TAREFA",
    "Defeito": "DEFEITO",
    "Melhoria": "MELHORIA",
    "Documentação": "DOCUMENTACAO"
};
const tipoParaTela: Record<string, string> = {
    "TAREFA": "Tarefa",
    "DEFEITO": "Defeito",
    "MELHORIA": "Melhoria",
    "DOCUMENTACAO": "Documentação"
};
const prioridadeParaBanco: Record<string, string> = {
    "Crítica": "CRITICA",
    "Alta": "ALTA",
    "Média": "MEDIA",
    "Baixa": "BAIXA"
};
const prioridadeParaTela: Record<string, string> = {
    "CRITICA": "Crítica",
    "ALTA": "Alta",
    "MEDIA": "Média",
    "BAIXA": "Baixa"
};
const statusParaTela: Record<string, string> = {
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
async function ehFeriado(data: string): Promise<boolean> {
    // a data vem como AAAA-MM-DD, então o ano são os 4 primeiros caracteres
    const ano = data.substring(0, 4);

    const resposta = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
    
    if (!resposta.ok) {
        throw new Error("API de feriados fora do ar");
    }

    const feriados: any[] = await resposta.json();

    // true se algum feriado tem a mesma data
    return feriados.some((feriado) => feriado.date === data);
}

// confere o prazo -o prazo é opcional, mas se vier não pode ser data errada nem feriado-
// devolve o erro {codigo, mensagem}, ou null se tá tudo certo
async function validarPrazo(prazo: string): Promise<{ codigo: number; mensagem: string } | null> {
    if (isNaN(Date.parse(prazo))) {
        return { codigo: 400, mensagem: "Prazo inválido." };
    }

    try {
        if (await ehFeriado(prazo)) {
            return { codigo: 400, mensagem: "O prazo não pode ser em um feriado nacional." };
        }
    } catch (erro) {
        // a API de fora não respondeu, então não dá p/ saber se é feriado
        return { codigo: 502, mensagem: "Não foi possível verificar se o prazo é feriado. Tente de novo." };
    }

    return null;
}

// busca uma demanda no banco pelo id (devolve a linha do banco ou null se não existir)
// o prazo já volta como texto AAAA-MM-DD, igual o input de data da tela usa
async function buscarDemanda(id: number): Promise<any | null> {
    const resultado = await executar(
        `SELECT ID_DEMANDA, TITULO, DESCRICAO, TIPO, PRIORIDADE, STATUS,
                TO_CHAR(PRAZO_FINAL, 'YYYY-MM-DD') AS PRAZO_FINAL,
                PROJETO_ID, DATA_CRIACAO, DATA_ATUALIZACAO
         FROM pi2Demandas
         WHERE ID_DEMANDA = :id
           AND ATIVO = 'S'`,
        { id }
    );

    return resultado.rows.length > 0 ? resultado.rows[0] : null;
}

// transforma a linha do banco (COLUNAS_EM_MAIUSCULO) no JSON que a tela já espera
function linhaParaDemanda(linha: any) {
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
async function registrarHistorico(
    demandaId: number,
    usuarioId: number,
    campo: string,
    valorAntes: string | null,
    valorNovo: string | null
) {
    await executar(
        `INSERT INTO pi2HistoricosDeDemandas
            (DEMANDA_ID, USUARIO_ID, CAMPO_ALTERADO, VALOR_ANTERIOR, VALOR_NOVO, DATA_ALTERACAO)
         VALUES
            (:demandaId, :usuarioId, :campo, :valorAntes, :valorNovo, SYSTIMESTAMP)`,
        { demandaId, usuarioId, campo, valorAntes, valorNovo }
    );
}

//rotas
// POST /api/demandas -quando clica em CADASTRAR na tela-
router.post("/", async (req: Request, res: Response) => {
    
    // o app.ts simula o login e deixa o usuário em req.usuario
    // a coluna CRIADO_POR do banco é obrigatória, então quem cria é quem está logado
    // quem está logado é quem faz a alteração (vai pro histórico)
    const usuarioId = (req as Request & { usuario?: { id: number } }).usuario?.id;

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
        const erroPrazo = await validarPrazo(prazo);
        if (erroPrazo) {
            res.status(erroPrazo.codigo).json({ mensagem: erroPrazo.mensagem });
            return;
        }
    }

        try {
        // INSERT: status (ABERTA) e as datas não são enviados,
        // quem decide isso é o próprio banco (DEFAULT da tabela), a pessoa n preenche
        // RETURNING devolve o id que o banco gerou
        const resultado = await executar(
            `INSERT INTO pi2Demandas
                (TITULO, DESCRICAO, TIPO, PRIORIDADE, PRAZO_FINAL, PROJETO_ID, CRIADO_POR)
             VALUES
                (:titulo, :descricao, :tipo, :prioridade,
                 TO_DATE(:prazo, 'YYYY-MM-DD'), :projetoId, :criadoPor)
             RETURNING ID_DEMANDA INTO :novoId`,
            {
                titulo,
                descricao,
                tipo: tipoParaBanco[tipo],
                prioridade: prioridadeParaBanco[prioridade],
                prazo: prazo || null,
                projetoId: Number(projetoId),
                criadoPor: usuarioId,
                novoId: { dir: BIND_OUT, type: TIPO_NUMERO }
            }
        );

        const novoId = resultado.outBinds.novoId[0];
        const novaDemanda = await buscarDemanda(novoId);

        // 201 = criou certinho
        res.status(201).json(linhaParaDemanda(novaDemanda));
    } catch (erro) {
        console.error("Erro ao cadastrar demanda:", erro);
        res.status(500).json({ mensagem: "Não foi possível cadastrar a demanda." });
    }
});

// Autor: Camille
// RA: 26895813

// GET /api/demandas - lista todas as demandas cadastradas
router.get("/", async (req: Request, res: Response) => {
    try {
        const resultado = await executar(
            `SELECT ID_DEMANDA, TITULO, DESCRICAO, TIPO, PRIORIDADE, STATUS,
                    TO_CHAR(PRAZO_FINAL, 'YYYY-MM-DD') AS PRAZO_FINAL,
                    PROJETO_ID, DATA_CRIACAO, DATA_ATUALIZACAO
             FROM pi2Demandas
             WHERE ATIVO = 'S'
             ORDER BY DATA_CRIACAO DESC`
        );

        // transforma cada linha do banco no formato que a tela espera
        const demandas = resultado.rows.map((linha: any) =>
            linhaParaDemanda(linha)
        );

        res.status(200).json(demandas);

    } catch (erro) {
        console.error("Erro ao listar demandas:", erro);
        res.status(500).json({
            mensagem: "Não foi possível listar as demandas."
        });
    }
});

// GET /api/demandas/:id -busca uma demanda, a tela de edição usa p/ preencher o formulário-
router.get("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        res.status(400).json({ mensagem: "Id inválido." });
        return;
    }
    
    try {
        const demanda = await buscarDemanda(id)
    
    // se não achou a demanda com esse id, devolve 404
        if (!demanda) {
            res.status(404).json({ mensagem: "Demanda não encontrada." });
            return;
        }

        res.status(200).json(linhaParaDemanda(demanda));
    } catch (erro) {
        console.error("Erro ao buscar demanda:", erro);
        res.status(500).json({mensagem: "Não foi possível consultar a demanda."});
    }
});

// PUT /api/demandas/:id -atualiza uma demanda, a tela usa quando está editando-
router.put("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        res.status(400).json({ mensagem: "Id inválido." });
        return;
    }

    // quem está logado é quem faz a alteração (vai pro histórico)
    const usuarioId = (req as Request & { usuario?: { id: number } }).usuario?.id;

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
        const erroPrazo = await validarPrazo(prazo);
        if (erroPrazo) {
            res.status(erroPrazo.codigo).json({ mensagem: erroPrazo.mensagem });
            return;
        }
    }

    try {

        // guarda como a demanda estava ANTES de editar, pra comparar depois
        const antes = await buscarDemanda(id);

        if (!antes) {
        res.status(404).json({ mensagem: "Demanda não encontrada." });
        return;
    }
    
        const resultado = await executar(
            `UPDATE pi2Demandas
             SET TITULO = :titulo,
                 DESCRICAO = :descricao,
                 TIPO = :tipo,
                 PRIORIDADE = :prioridade,
                 PRAZO_FINAL = TO_DATE(:prazo, 'YYYY-MM-DD'),
                 PROJETO_ID = :projetoId,
                 DATA_ATUALIZACAO = SYSTIMESTAMP
             WHERE ID_DEMANDA = :id
               AND ATIVO = 'S'`,
            {
                titulo,
                descricao,
                tipo: tipoParaBanco[tipo],
                prioridade: prioridadeParaBanco[prioridade],
                prazo: prazo || null,
                projetoId: Number(projetoId),
                id
            }
        );

        if (resultado.rowsAffected === 0) {
            res.status(404).json({ mensagem: "Demanda não encontrada." });
            return;
        }

        // se a prioridade mudou, registra no histórico
        if (antes.PRIORIDADE !== prioridadeParaBanco[prioridade]) {
            await registrarHistorico(id, usuarioId, "prioridade", antes.PRIORIDADE, prioridadeParaBanco[prioridade]);
        }

        // mesma coisa pro título e pro tipo
        if (antes.TITULO !== titulo) {
            await registrarHistorico(id, usuarioId, "titulo", antes.TITULO, titulo);
        }

        if (antes.TIPO !== tipoParaBanco[tipo]) {
            await registrarHistorico(id, usuarioId, "tipo", antes.TIPO, tipoParaBanco[tipo]);
        }

        // prazo pode ser vazio, então compara tratando null
        const prazoNovo = prazo || null;

        if ((antes.PRAZO_FINAL ?? null) !== prazoNovo) {
            await registrarHistorico(id, usuarioId, "prazo_final", antes.PRAZO_FINAL ?? null, prazoNovo);
        }

        // busca de novo para devolver já com a data de atualização nova
        const demanda = await buscarDemanda(id);
        res.status(200).json(linhaParaDemanda(demanda));

    } catch (erro) {
        console.error("Erro ao atualizar demanda:", erro);
        res.status(500).json({ mensagem: "Não foi possível atualizar a demanda." });
    }  
});

export default router;