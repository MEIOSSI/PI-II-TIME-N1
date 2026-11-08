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
                PROJETO_ID, RESPONSAVEL_ID, DATA_CRIACAO, DATA_ATUALIZACAO
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
        responsavelId: linha.RESPONSAVEL_ID,
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

// confere se o usuário pode criar/editar demandas desse projeto
// Administrador pode em qualquer projeto, Líder só nos projetos em que é o líder
// o Membro da Equipe não cria nem edita demanda (ele só muda o status das dele, na tela do Murilo)
async function podeGerenciarProjeto(usuarioId: number, projetoId: number): Promise<boolean> {
    const resultado = await executar(
        `SELECT
            (SELECT COUNT(*) FROM pi2Usuarios
              WHERE ID_USUARIO = :usuarioId AND PERFIL = 'ADMINISTRADOR' AND ATIVO = 'S') AS EH_ADMIN,
            (SELECT COUNT(*) FROM pi2Projetos
              WHERE ID_PROJETO = :projetoId AND LIDER = :usuarioId AND ATIVO = 'S') AS EH_LIDER
         FROM DUAL`,
        { usuarioId, projetoId }
    );

    const linha = resultado.rows[0];
    return Number(linha.EH_ADMIN) > 0 || Number(linha.EH_LIDER) > 0;
}

// confere se o usuário é líder ou membro do projeto (só eles podem ser responsáveis)
async function participaDoProjeto(usuarioId: number, projetoId: number): Promise<boolean> {
    const resultado = await executar(
        `SELECT
            (SELECT COUNT(*) FROM pi2Projetos
              WHERE ID_PROJETO = :projetoId AND LIDER = :usuarioId AND ATIVO = 'S') AS EH_LIDER,
            (SELECT COUNT(*) FROM pi2MembrosDosProjetos
              WHERE PROJETO_ID = :projetoId AND USUARIO_ID = :usuarioId) AS EH_MEMBRO
         FROM DUAL`,
        { usuarioId, projetoId }
    );

    const linha = resultado.rows[0];
    return Number(linha.EH_LIDER) > 0 || Number(linha.EH_MEMBRO) > 0;
}

// devolve o nome do usuário (o histórico guarda o nome e não o id, pra aparecer certo na tela)
async function nomeDoUsuario(usuarioId: number | null): Promise<string | null> {
    if (!usuarioId) {
        return null;
    }

    const resultado = await executar(
        `SELECT NOME FROM pi2Usuarios WHERE ID_USUARIO = :usuarioId`,
        { usuarioId }
    );

    return resultado.rows.length > 0 ? resultado.rows[0].NOME : null;
}

//rotas
// POST /api/demandas -quando clica em CADASTRAR na tela-
router.post("/", async (req: Request, res: Response) => {
    
    // o app.ts simula o login e deixa o usuário em req.usuario
    // quem está logado é quem faz a alteração (vai pro histórico)
    const usuarioId = (req as Request & { usuario?: { id: number } }).usuario?.id;

    if (!usuarioId) {
        res.status(401).json({ mensagem: "Usuário não autenticado." });
        return;
    }
    // desmonta o que a tela mandou, cada campo vira uma variável
    const { titulo, descricao, tipo, prioridade, projetoId, prazo, responsavelId } = req.body;

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

        // só Administrador ou o Líder do projeto cadastra demanda
        if (!await podeGerenciarProjeto(usuarioId, Number(projetoId))) {
            res.status(403).json({ mensagem: "Você não tem permissão para cadastrar demandas neste projeto." });
            return;
        }

        // o responsável é opcional, mas se vier precisa ser líder ou membro do projeto
        const idResponsavel = responsavelId ? Number(responsavelId) : null;

        if (idResponsavel && !await participaDoProjeto(idResponsavel, Number(projetoId))) {
            res.status(400).json({ mensagem: "O responsável precisa participar do projeto." });
            return;
        }

        // INSERT: status (ABERTA) e as datas não são enviados,
        // quem decide isso é o próprio banco (DEFAULT da tabela), a pessoa n preenche
        // RETURNING devolve o id que o banco gerou
        const resultado = await executar(
            `INSERT INTO pi2Demandas
                (TITULO, DESCRICAO, TIPO, PRIORIDADE, PRAZO_FINAL, PROJETO_ID, RESPONSAVEL_ID, CRIADO_POR)
             VALUES
                (:titulo, :descricao, :tipo, :prioridade,
                TO_DATE(:prazo, 'YYYY-MM-DD'), :projetoId, :responsavelId, :criadoPor)
             RETURNING ID_DEMANDA INTO :novoId`,
            {
                titulo,
                descricao,
                tipo: tipoParaBanco[tipo],
                prioridade: prioridadeParaBanco[prioridade],
                prazo: prazo || null,
                projetoId: Number(projetoId),
                responsavelId: idResponsavel,
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

// GET /api/demandas/projeto/:id/membros -lista o líder e os membros do projeto, pro select de responsável-
router.get("/projeto/:id/membros", async (req: Request, res: Response) => {
    const projetoId = Number(req.params.id);

    if (!Number.isInteger(projetoId) || projetoId <= 0) {
        res.status(400).json({ mensagem: "Id do projeto inválido." });
        return;
    }

    try {
        const resultado = await executar(
            `SELECT u.ID_USUARIO, u.NOME
               FROM pi2Usuarios u
              WHERE u.ATIVO = 'S'
                AND (
                    u.ID_USUARIO = (SELECT LIDER FROM pi2Projetos
                                     WHERE ID_PROJETO = :projetoId AND ATIVO = 'S')
                    OR u.ID_USUARIO IN (SELECT USUARIO_ID FROM pi2MembrosDosProjetos
                                         WHERE PROJETO_ID = :projetoId)
                )
              ORDER BY u.NOME`,
            { projetoId }
        );

        res.status(200).json(resultado.rows.map((linha: any) => ({
            id: linha.ID_USUARIO,
            nome: linha.NOME
        })));
    } catch (erro) {
        console.error("Erro ao buscar membros do projeto:", erro);
        res.status(500).json({ mensagem: "Não foi possível consultar os membros do projeto." });
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

    const { titulo, descricao, tipo, prioridade, projetoId, responsavelId, prazo } = req.body;

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
    
        // só Administrador ou o Líder do projeto edita (inclusive do projeto novo, se mudou de projeto)
        if (!await podeGerenciarProjeto(usuarioId, Number(antes.PROJETO_ID))
            || !await podeGerenciarProjeto(usuarioId, Number(projetoId))) {
            res.status(403).json({ mensagem: "Você não tem permissão para editar esta demanda." });
            return;
        }

        // o responsável é opcional, mas se vier precisa ser líder ou membro do projeto
        // se a tela não mandou responsavelId, mantém o que já estava
        const idResponsavel = responsavelId === undefined
            ? (antes.RESPONSAVEL_ID ?? null)
            : (responsavelId ? Number(responsavelId) : null);

        if (idResponsavel && !await participaDoProjeto(idResponsavel, Number(projetoId))) {
            res.status(400).json({ mensagem: "O responsável precisa participar do projeto." });
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
                 RESPONSAVEL_ID = :responsavelId,
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
                responsavelId: idResponsavel,
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

                // se trocou o responsável, registra no histórico com o NOME das pessoas
        // (a constraint do banco só aceita "RESPONSAVEL" em maiúsculo)
        const responsavelAntes = antes.RESPONSAVEL_ID ?? null;

        if (responsavelAntes !== idResponsavel) {
            await registrarHistorico(
                id,
                usuarioId,
                "RESPONSAVEL",
                await nomeDoUsuario(responsavelAntes),
                await nomeDoUsuario(idResponsavel)
            );
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