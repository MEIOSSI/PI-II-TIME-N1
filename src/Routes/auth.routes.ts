import { Router, Request, Response } from "express";
import { validarSenha } from "../Functions/Validators/senha.validator";
import { validarCadastro } from "../Functions/Validators/cadastro.validator";
import bcrypt from "bcrypt";
import { executarConsulta, executarComando } from "../Database/db";

const router = Router();

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

export default router;