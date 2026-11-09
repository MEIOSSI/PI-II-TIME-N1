"use strict";
// por: Vitor Hugo Turati Ianagui - <RA>
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarRedefinicao = validarRedefinicao;
const senha_validator_1 = require("./senha.validator");
const login_validator_1 = require("./login.validator");
function validarRedefinicao(dados) {
    const erros = [];
    const email = dados.email.trim();
    if (!email) {
        erros.push("Informe seu e-mail.");
    }
    else if (!login_validator_1.REGEX_EMAIL.test(email)) {
        erros.push("Informe um e-mail válido.");
    }
    if (!dados.senhaAtual) {
        erros.push("Digite sua senha atual.");
    }
    // Mesmas regras do cadastro
    erros.push(...(0, senha_validator_1.validarSenha)(dados.novaSenha));
    if (!dados.confirmaNovaSenha) {
        erros.push("Confirme sua nova senha.");
    }
    else if (dados.confirmaNovaSenha !== dados.novaSenha) {
        erros.push("As senhas não conferem.");
    }
    if (dados.novaSenha && dados.novaSenha === dados.senhaAtual) {
        erros.push("A nova senha deve ser diferente da senha atual.");
    }
    return erros;
}
//# sourceMappingURL=redefinicao.validator.js.map