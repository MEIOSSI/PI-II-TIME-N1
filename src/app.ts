import Express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import { conectarBanco, executarConsulta } from "./Database/db";
import path from "path";

const app = Express();
const PORT = process.env.PORT || 3000;

app.use(Express.json());
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
