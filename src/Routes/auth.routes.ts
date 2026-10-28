import { Router, Request, Response } from "express";
import { validarSenha } from "../Functions/Validators/senha.validator";
import { validarCadastro } from "../Functions/Validators/cadastro.validator";

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

        return res.status(200).json({
            mensagem: "Validações concluídas com sucesso."
        });
    } catch (erro) {
        console.error("Erro ao validar cadastro:", erro);

        return res.status(500).json({
            mensagem: "Não foi possível validar o cadastro. Tente novamente."
        });
    }
});

export default router;