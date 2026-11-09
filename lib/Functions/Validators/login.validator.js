"use strict";
// por: Vitor Hugo Turati Ianagui - <26025950>
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGEX_EMAIL = void 0;
exports.validarLogin = validarLogin;
exports.REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validarLogin(dados) {
    const erros = [];
    const email = dados.email.trim();
    if (!email) {
        erros.push("Informe seu e-mail.");
    }
    else if (!exports.REGEX_EMAIL.test(email)) {
        erros.push("Informe um e-mail válido.");
    }
    if (!dados.senha) {
        erros.push("Digite sua senha.");
    }
    return erros;
}
//# sourceMappingURL=login.validator.js.map