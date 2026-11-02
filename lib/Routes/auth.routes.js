"use strict";
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
const express_1 = require("express");
const senha_validator_1 = require("../Functions/Validators/senha.validator");
const cadastro_validator_1 = require("../Functions/Validators/cadastro.validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../Database/db");
const router = (0, express_1.Router)();
router.post("/validar-senha", (req, res) => {
    const { senha } = req.body;
    if (typeof senha !== "string") {
        return res.status(400).json({
            mensagem: "A senha deve ser enviada como texto."
        });
    }
    const erros = (0, senha_validator_1.validarSenha)(senha);
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
router.post("/cadastro", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (typeof (dados === null || dados === void 0 ? void 0 : dados[campo]) !== "string") {
            return res.status(400).json({
                mensagem: `O campo ${campo} é obrigatório e deve ser texto.`
            });
        }
    }
    try {
        const erros = yield (0, cadastro_validator_1.validarCadastro)(dados);
        if (erros.length > 0) {
            return res.status(400).json({
                mensagem: "Existem erros no cadastro.",
                erros
            });
        }
        const usuariosExistentes = yield (0, db_1.executarConsulta)(`SELECT ID_USUARIO
            FROM pi2Usuarios
            WHERE EMAIL = :email`, { email: dados.email });
        if (usuariosExistentes.length > 0) {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }
        const senhaHash = yield bcrypt_1.default.hash(dados.senha, 10);
        yield (0, db_1.executarComando)(`INSERT INTO pi2Usuarios (NOME, EMAIL, SENHA)
             VALUES (:nome, :email, :senha)`, {
            nome: dados.nome,
            email: dados.email,
            senha: senhaHash
        });
        return res.status(201).json({
            mensagem: "Cadastro realizado com sucesso."
        });
    }
    catch (erro) {
        const erroOracle = erro;
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
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map