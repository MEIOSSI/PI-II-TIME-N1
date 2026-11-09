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
const login_validator_1 = require("../Functions/Validators/login.validator");
const redefinicao_validator_1 = require("../Functions/Validators/redefinicao.validator");
const senha_hash_1 = require("../Functions/Utils/senha.hash");
const db_1 = require("../Database/db");
const router = (0, express_1.Router)();
// por: Vitor Hugo Turati Ianagui - <RA>
function buscarUsuarioAtivoPorEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const usuarios = yield (0, db_1.executarConsulta)(`SELECT ID_USUARIO, NOME, EMAIL, SENHA, PERFIL
         FROM pi2Usuarios
         WHERE LOWER(EMAIL) = :email
           AND ATIVO = 'S'`, { email: email.trim().toLowerCase() });
        return usuarios[0];
    });
}
// Mesma mensagem para e-mail inexistente e senha errada,
// para não revelar quais e-mails estão cadastrados
const MENSAGEM_CREDENCIAIS_INVALIDAS = "E-mail ou senha incorretos.";
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
// por: Vitor Hugo Turati Ianagui - <26025950>
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, senha } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
    if (typeof email !== "string" || typeof senha !== "string") {
        return res.status(400).json({ mensagem: "E-mail e senha devem ser enviados como texto." });
    }
    const erros = (0, login_validator_1.validarLogin)({ email, senha });
    if (erros.length > 0) {
        return res.status(400).json({ mensagem: "Existem erros no login.", erros });
    }
    try {
        const usuario = yield buscarUsuarioAtivoPorEmail(email);
        const senhaCorreta = yield (0, senha_hash_1.compararSenha)(senha, usuario === null || usuario === void 0 ? void 0 : usuario.SENHA);
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
    }
    catch (erro) {
        console.error("Erro ao realizar login:", erro);
        return res.status(500).json({ mensagem: "Não foi possível realizar o login. Tente novamente." });
    }
}));
// por: Vitor Hugo Turati Ianagui - <26025950>
router.post("/redefinir-senha", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dados = req.body;
    const campos = ["email", "senhaAtual", "novaSenha", "confirmaNovaSenha"];
    for (const campo of campos) {
        if (typeof (dados === null || dados === void 0 ? void 0 : dados[campo]) !== "string") {
            return res.status(400).json({ mensagem: `O campo ${campo} é obrigatório e deve ser texto.` });
        }
    }
    // 1) Formato
    const erros = (0, redefinicao_validator_1.validarRedefinicao)(dados);
    if (erros.length > 0) {
        return res.status(400).json({ mensagem: "Existem erros na redefinição de senha.", erros });
    }
    try {
        // 2) Senha atual confere com o hash do banco?
        const usuario = yield buscarUsuarioAtivoPorEmail(dados.email);
        const senhaAtualCorreta = yield (0, senha_hash_1.compararSenha)(dados.senhaAtual, usuario === null || usuario === void 0 ? void 0 : usuario.SENHA);
        if (!usuario || !senhaAtualCorreta) {
            return res.status(401).json({
                mensagem: MENSAGEM_CREDENCIAIS_INVALIDAS,
                erros: ["E-mail ou senha atual incorretos."]
            });
        }
        // 3) Salva o hash da nova senha
        const novoHash = yield (0, senha_hash_1.gerarHashSenha)(dados.novaSenha);
        yield (0, db_1.executarComando)(`UPDATE pi2Usuarios
             SET SENHA = :novoHash
             WHERE ID_USUARIO = :idUsuario
               AND ATIVO = 'S'`, { novoHash, idUsuario: Number(usuario.ID_USUARIO) });
        return res.status(200).json({ mensagem: "Senha redefinida com sucesso." });
    }
    catch (erro) {
        console.error("Erro ao redefinir senha:", erro);
        return res.status(500).json({ mensagem: "Não foi possível redefinir a senha. Tente novamente." });
    }
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map