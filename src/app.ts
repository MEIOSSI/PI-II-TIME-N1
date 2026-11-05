//Este arquivo contém multiplos autores.
// verifique o autor  no topo de cada trecho.

import Express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import { conectarBanco, executarConsulta, executarComando } from "./Database/db";
import path from "path";
import authRoutes from "./Routes/auth.routes";

const app = Express();
const PORT = process.env.PORT || 3000;

app.use(Express.json());
app.use("/api/auth", authRoutes);
app.use(Express.static(path.join(__dirname, "../public")));

// Emulação de login: assume o líder cadastrado no projeto 1.
// Esta simulação não é ativada em produção.
app.use(async (req: Request, _res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "production") {
        return next();
    }

    try {
        const lideres = await executarConsulta(
            `SELECT LIDER
             FROM pi2Projetos
             WHERE ID_PROJETO = :idProjeto
               AND ATIVO = 'S'`,
            { idProjeto: 1 }
        ) as Array<{ LIDER: number }>;

        if (lideres.length > 0) {
            (req as Request & { usuario?: { id: number; papel: string } }).usuario = {
                id: Number(lideres[0].LIDER),
                papel: "LIDER"
            };
        }
    } catch (erro) {
        console.error("Erro ao simular login do líder do projeto 1:", erro);
    }

    next();
});

app.get("/api/usuarios", async (_req: Request, res: Response) => {
    try {
        const usuarios = await executarConsulta(
            `SELECT ID_USUARIO, NOME, EMAIL, PERFIL, ATIVO, DATA_CRIACAO
             FROM pi2Usuarios
             ORDER BY ID_USUARIO`
        );

        return res.json(usuarios);
    } catch (erro) {
        console.error("Erro ao consultar usuários:", erro);
        return res.status(500).json({
            erro: "Não foi possível consultar os usuários."
        });
    }
});

app.get("/", (_req: Request, res: Response) => {
    return res.sendFile(
        path.join(__dirname, "../public/Views/login/tela-login/login.html")
    );
});

app.get("/cadastrar-usuario", (_req: Request, res: Response) => {
    return res.sendFile(
        path.join(__dirname, "../public/Views/login/tela-cadastro/cadastro.html")
    );
});

//rota da tela de projetos
//por Valentina Bastos - 26893594
app.get("/projetos", async (req: Request, res: Response) => {
    const reqAutenticada = req as Request & {
        usuario?: { id: number };
    };

    const usuarioId = reqAutenticada.usuario?.id;

    if (!usuarioId) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
    }

    try {
        const projetos = await executarConsulta(
            `SELECT
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
             ORDER BY p.TITULO`,
            { usuarioId }
        );

        const usuarios = await executarConsulta(
            `SELECT ID_USUARIO, NOME, PERFIL
            FROM pi2Usuarios
            WHERE ID_USUARIO = :usuarioId`,
            { usuarioId }
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        return res.json({
            usuario: usuarios[0],
            projetos
        });

    } catch (erro) {
        console.error("Erro ao consultar projetos do usuário:", erro);
        return res.status(500).json({
            erro: "Não foi possível consultar os projetos."
        });
    }
});

//rota da tela de demandas
//por Valentina Bastos - 26893594
app.get("/projetos/:id/demandas", async (req: Request, res: Response) => {
    const idProjeto = Number(req.params.id);

    if (!Number.isInteger(idProjeto) || idProjeto <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
    }

    const reqAutenticada = req as Request & {
        usuario?: { id: number };
    };

    const usuarioId = reqAutenticada.usuario?.id;

    if (!usuarioId) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
    }

    try {
        const demandas = await executarConsulta(
            `SELECT
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
               AND d.ATIVO = 'S'
             ORDER BY d.ID_DEMANDA`,
            { idProjeto }
        );

        const usuarios = await executarConsulta(
            `SELECT ID_USUARIO, NOME, PERFIL
            FROM pi2Usuarios
            WHERE ID_USUARIO = :usuarioId`,
            { usuarioId }
        );

        const nomeProjeto = await executarConsulta(
            `SELECT TITULO
             FROM pi2Projetos
             WHERE ID_PROJETO = :idProjeto`,
            { idProjeto }
        );

        return res.status(200).json({
            demandas,
            usuario: usuarios[0],
            nomeProjeto
        });
    } catch (erro) {
        console.error("Não foi possível acessar a tela de demandas.", erro);
        return res.status(500).json({
            erro: "Não foi possível consultar a tela de demandas."
        });
    }
});


//rotas detalhes de demanda
//por Murilo Lopes - 26894964
app.get("/demanda/:id" , async (req: Request, res: Response) => {

    try {
    const idDemanda = Number(req.params.id);

    if(!Number.isInteger(idDemanda) || idDemanda <= 0){
        return res.status(400).json({msg: "ID é inválido."});
    }

    const detalhesDemanda = await executarConsulta(
        `SELECT
            pi2Demandas.*,
            pi2Projetos.TITULO AS NOME_PROJETO,
            pi2Usuarios.NOME AS NOME_RESPONSAVEL
         FROM pi2Demandas
         INNER JOIN pi2Projetos
            ON pi2Demandas.PROJETO_ID = pi2Projetos.ID_PROJETO
         LEFT JOIN pi2Usuarios
            ON pi2Demandas.RESPONSAVEL_ID = pi2Usuarios.ID_USUARIO
         WHERE pi2Demandas.ID_DEMANDA = :id
           AND pi2Demandas.ATIVO = 'S'`,
        { id: idDemanda }
    );

    const usuarioId = (req as Request & { usuario?: { id: number } }).usuario?.id;

    if (detalhesDemanda.length > 0 && usuarioId) {
        const usuarioEpapel = await executarConsulta(
            `SELECT
                (SELECT pi2Usuarios.NOME
                 FROM pi2Usuarios
                 WHERE pi2Usuarios.ID_USUARIO = :usuarioId) AS NOME_USUARIO_LOGADO,
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
             WHERE pi2Demandas.ID_DEMANDA = :id`,
            { usuarioId, id: idDemanda }
        );

        if (usuarioEpapel.length > 0) {
            Object.assign(detalhesDemanda[0], usuarioEpapel[0]);
        }
    }

    return res.json(detalhesDemanda);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao buscar a demanda." });
    }
});

//por Murilo Lopes - 26894964
app.put("/demanda/:id/status", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const usuarioId = (req as Request & { usuario?: { id: number } }).usuario?.id;
    const statusNovo = String(req.body?.status ?? "").trim().toUpperCase();

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID da demanda inválido." });
    }

    if (!usuarioId) {
        return res.status(401).json({ erro: "Usuário não autenticado." });
    }

    const proximoStatus: Record<string, string> = {
        ABERTA: "EM ANDAMENTO",
        "EM ANDAMENTO": "EM REVISAO",
        "EM REVISAO": "CONCLUIDA"
    };

    try {
        const resultado = await executarConsulta(
            `SELECT
                pi2Demandas.STATUS,
                pi2Projetos.LIDER,
                pi2MembrosDosProjetos.PAPEL_NO_PROJETO
             FROM pi2Demandas
             INNER JOIN pi2Projetos
                ON pi2Demandas.PROJETO_ID = pi2Projetos.ID_PROJETO
             LEFT JOIN pi2MembrosDosProjetos
                ON pi2MembrosDosProjetos.PROJETO_ID = pi2Demandas.PROJETO_ID
                AND pi2MembrosDosProjetos.USUARIO_ID = :usuarioId
             WHERE pi2Demandas.ID_DEMANDA = :id
                AND pi2Demandas.ATIVO = 'S'`,
            { id, usuarioId }
        ) as Array<{
            STATUS: string;
            LIDER: number;
            PAPEL_NO_PROJETO: string | null;
        }>;

        if (resultado.length === 0) {
            return res.status(404).json({ erro: "Demanda não encontrada." });
        }

        const demanda = resultado[0];
        const statusAtual = demanda.STATUS.trim().toUpperCase();
        const ehLider = Number(demanda.LIDER) === usuarioId;
        const ehMembro = demanda.PAPEL_NO_PROJETO === "MEMBRO_DA_EQUIPE";

        if (!ehLider && !ehMembro) {
            return res.status(403).json({ erro: "Você não participa deste projeto." });
        }

        if (proximoStatus[statusAtual] !== statusNovo) {
            return res.status(400).json({ erro: "Transição de status inválida." });
        }

        if (statusAtual === "EM REVISAO" && statusNovo === "CONCLUIDA" && !ehLider) {
            return res.status(403).json({ erro: "Somente o líder do projeto pode concluir a demanda." });
        }

        await executarComando(
            `BEGIN
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
             END;`,
            { id, usuarioId, statusAtual, statusNovo }
        );

        return res.json({ mensagem: "Status atualizado.", status: statusNovo });
    } catch (error) {
        if ((error as { errorNum?: number }).errorNum === 20001) {
            return res.status(409).json({ erro: "O status mudou. Atualize a página." });
        }

        console.error("Erro ao atualizar status:", error);
        return res.status(500).json({ erro: "Não foi possível atualizar o status." });
    }
});

//por Murilo Lopes - 26894964
app.get("/demanda/:id/historico", async (req: Request, res: Response) => {
    const idDemanda = Number(req.params.id);

    if (!Number.isInteger(idDemanda) || idDemanda <= 0) {
        return res.status(400).json({ msg: "ID é inválido." });
    }

    try {
        const historico = await executarConsulta(
            `SELECT
                pi2HistoricosDeDemandas.CAMPO_ALTERADO,
                pi2HistoricosDeDemandas.VALOR_ANTERIOR,
                pi2HistoricosDeDemandas.VALOR_NOVO,
                pi2HistoricosDeDemandas.DATA_ALTERACAO,
                pi2Usuarios.NOME AS NOME_USUARIO
             FROM pi2HistoricosDeDemandas
             INNER JOIN pi2Usuarios
                ON pi2HistoricosDeDemandas.USUARIO_ID = pi2Usuarios.ID_USUARIO
             WHERE pi2HistoricosDeDemandas.DEMANDA_ID = :id
             ORDER BY pi2HistoricosDeDemandas.DATA_ALTERACAO ASC`,
            { id: idDemanda }
        );

        return res.json(historico);
    } catch (error) {
        console.error("Erro ao buscar histórico da demanda:", error);
        return res.status(500).json({ erro: "Erro ao buscar o histórico da demanda." });
    }
});

//por Murilo Lopes - 26894964
async function iniciarServidor() {
    try {
        await conectarBanco();

        app.listen(PORT, () => {
            console.log(`Servidor iniciado em http://localhost:${PORT}`);
        });
    } catch (erro) {
        console.error("Erro ao iniciar a aplicação:", erro);
        process.exit(1);
    }
}

iniciarServidor();
