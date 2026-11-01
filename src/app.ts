import Express, {Request, Response} from "express";
import 'dotenv/config';
import { conectarBanco, executarConsulta } from "./Database/db";
import path from "path";
const app = Express();
const PORT = process.env.PORT || 3000;

app.use(Express.json());
app.use(Express.static(path.join(__dirname, "public")));

app.get("/api/usuarios", async (_req: Request, res: Response) => {
    try {
        const usuarios = await executarConsulta(
            `SELECT ID_USUARIO, NOME, EMAIL, PERFIL, ATIVO, DATA_CRIACAO
             FROM pi2Usuarios
             ORDER BY ID_USUARIO`
        );
        res.json(usuarios);
    } catch (erro) {
        console.error("Erro ao consultar usuários:", erro);
        res.status(500).json({ erro: "Não foi possível consultar os usuários." });
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

//rotas
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/Views/login/tela-login/login.html"));
});

app.get("/cadastrar-usuario", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/Views/login/tela-cadastro/cadastro.html"));
});

