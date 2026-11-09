import { Router, Request, Response } from "express";
import { validarSenha } from "../Functions/Validators/senha.validator";
import { validarCadastro } from "../Functions/Validators/cadastro.validator";
import bcrypt from "bcrypt";
import { validarLogin } from "../Functions/Validators/login.validator";
import { validarRedefinicao } from "../Functions/Validators/redefinicao.validator";
import { compararSenha, gerarHashSenha } from "../Functions/Utils/senha.hash";
import { executarConsulta, executarComando } from "../Database/db";

const router = Router();

// O Oracle devolve os nomes das colunas em maiúsculo
type UsuarioBanco = {
    ID_USUARIO: number;
    NOME: string;
    EMAIL: string;
    SENHA: string;
    PERFIL: string;
};

// por: Vitor Hugo Turati Ianagui - <RA>
async function buscarUsuarioAtivoPorEmail(email: string): Promise<UsuarioBanco | undefined> {
    const usuarios = await executarConsulta<UsuarioBanco>(
        `SELECT ID_USUARIO, NOME, EMAIL, SENHA, PERFIL
         FROM pi2Usuarios
         WHERE LOWER(EMAIL) = :email
           AND ATIVO = 'S'`,
        { email: email.trim().toLowerCase() }
    );
    return usuarios[0];
}

// Mesma mensagem para e-mail inexistente e senha errada,
// para não revelar quais e-mails estão cadastrados
const MENSAGEM_CREDENCIAIS_INVALIDAS = "E-mail ou senha incorretos.";

router.post("/validar-senha", (req:Request , res: Response) => {
    const { senha } = req.body

    if (typeof senha !== "string") {
        return res.status(400).json({
            mensagem: "A senha deve ser enviada como texto."
        });
    }

    const erros = validarSenha(senha)

    if (erros.length > 0) {
        return res.status(400).json({
            mensagem: "A senha não atende aos requisitos",
            erros
        });
    }

    return res.status(200).json({
        mensagem: "Senha válida"
    });
});

router.post("/cadastro", async (req: Request, res: Response) => {
    const dados = req.body;

    const campos = [
        "nome",
        "cpf",
        "telefone",
        "endereco",
        "cep",
        "email",
        "senha",
        "confirmaSenha"
    ];

    for (const campo of campos) {
        if (typeof dados?.[campo] !== "string") {
            return res.status(400).json({
                mensagem: `O campo ${campo} é obrigatório e deve ser texto.`
            });
        }
    }

    try {
        const erros = await validarCadastro(dados);

        if (erros.length > 0) {
            return res.status(400).json({
                mensagem: "Existem erros no cadastro.",
                erros
            });
        }

        const usuariosExistentes = await executarConsulta(
            `SELECT ID_USUARIO
            FROM pi2Usuarios
            WHERE EMAIL = :email`,
            { email: dados.email }
        );

        if (usuariosExistentes.length > 0) {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        const senhaHash = await bcrypt.hash(dados.senha, 10);

        await executarComando(
            `INSERT INTO pi2Usuarios (NOME, EMAIL, SENHA)
             VALUES (:nome, :email, :senha)`,
            {
                nome: dados.nome,
                email: dados.email,
                senha: senhaHash
            }
        );

        return res.status(201).json({
            mensagem: "Cadastro realizado com sucesso."
        });
    }

    catch (erro) {
        const erroOracle = erro as { errorNum?: number };

        if (erroOracle.errorNum === 1) {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        console.error("Erro ao realizar cadastro:", erro);

        return res.status(500).json({
            mensagem: "Não foi possível realizar o cadastro. Tente novamente."
        });
    }
});

// por: Vitor Hugo Turati Ianagui - <26025950>
router.post("/login", async (req: Request, res: Response) => {
    const { email, senha } = req.body ?? {};

    if (typeof email !== "string" || typeof senha !== "string") {
        return res.status(400).json({ mensagem: "E-mail e senha devem ser enviados como texto." });
    }

    const erros = validarLogin({ email, senha });
    if (erros.length > 0) {
        return res.status(400).json({ mensagem: "Existem erros no login.", erros });
    }

    try {
        const usuario = await buscarUsuarioAtivoPorEmail(email);
        const senhaCorreta = await compararSenha(senha, usuario?.SENHA);

        if (!usuario || !senhaCorreta) {
            return res.status(401).json({ mensagem: MENSAGEM_CREDENCIAIS_INVALIDAS });
        }

        // Nunca devolver o hash
        return res.status(200).json({
            mensagem: "Login realizado com sucesso.",
            usuario: {
                id: Number(usuario.ID_USUARIO),
                nome: usuario.NOME,
                email: usuario.EMAIL,
                perfil: usuario.PERFIL
            }
        });
    } catch (erro) {
        console.error("Erro ao realizar login:", erro);
        return res.status(500).json({ mensagem: "Não foi possível realizar o login. Tente novamente." });
    }
});

// por: Vitor Hugo Turati Ianagui - <26025950>
router.post("/redefinir-senha", async (req: Request, res: Response) => {
    const dados = req.body;
    const campos = ["email", "senhaAtual", "novaSenha", "confirmaNovaSenha"];

    for (const campo of campos) {
        if (typeof dados?.[campo] !== "string") {
            return res.status(400).json({ mensagem: `O campo ${campo} é obrigatório e deve ser texto.` });
        }
    }

    // 1) Formato
    const erros = validarRedefinicao(dados);
    if (erros.length > 0) {
        return res.status(400).json({ mensagem: "Existem erros na redefinição de senha.", erros });
    }

    try {
        // 2) Senha atual confere com o hash do banco?
        const usuario = await buscarUsuarioAtivoPorEmail(dados.email);
        const senhaAtualCorreta = await compararSenha(dados.senhaAtual, usuario?.SENHA);

        if (!usuario || !senhaAtualCorreta) {
            return res.status(401).json({
                mensagem: MENSAGEM_CREDENCIAIS_INVALIDAS,
                erros: ["E-mail ou senha atual incorretos."]
            });
        }

        // 3) Salva o hash da nova senha
        const novoHash = await gerarHashSenha(dados.novaSenha);
        await executarComando(
            `UPDATE pi2Usuarios
             SET SENHA = :novoHash
             WHERE ID_USUARIO = :idUsuario
               AND ATIVO = 'S'`,
            { novoHash, idUsuario: Number(usuario.ID_USUARIO) }
        );

        return res.status(200).json({ mensagem: "Senha redefinida com sucesso." });
    } catch (erro) {
        console.error("Erro ao redefinir senha:", erro);
        return res.status(500).json({ mensagem: "Não foi possível redefinir a senha. Tente novamente." });
    }
});

export default router;