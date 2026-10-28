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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarCadastro = validarCadastro;
const senha_validator_1 = require("./senha.validator");
const cpf_validator_1 = require("./cpf.validator");
const cep_validator_1 = require("./cep.validator");
function validarCadastro(dados) {
    return __awaiter(this, void 0, void 0, function* () {
        const erros = [];
        const nome = dados.nome.trim();
        const cpf = dados.cpf.replace(/\D/g, "");
        const telefone = dados.telefone.replace(/\D/g, "");
        const endereco = dados.endereco.trim();
        const cep = dados.cep.replace(/\D/g, "");
        const email = dados.email.trim();
        const senha = dados.senha;
        const confirmaSenha = dados.confirmaSenha;
        // Nome completo
        if (!nome) {
            erros.push("Digite seu nome completo.");
        }
        else if (nome.length < 5) {
            erros.push("O nome deve possuir pelo menos 5 caracteres.");
        }
        else if (nome.split(/\s+/).length < 2) {
            erros.push("Informe nome e sobrenome.");
        }
        // CPF: formato e quantidade de dígitos
        if (!cpf) {
            erros.push("Informe seu CPF.");
        }
        else if (!(0, cpf_validator_1.validarCPF)(cpf)) {
            erros.push("Informe um CPF válido.");
        }
        // Telefone
        if (!telefone) {
            erros.push("Informe um número de telefone.");
        }
        else if (telefone.length < 10 || telefone.length > 11) {
            erros.push("O telefone deve conter 10 ou 11 dígitos.");
        }
        // Endereço
        if (!endereco) {
            erros.push("Informe seu endereço.");
        }
        // CEP
        if (!cep) {
            erros.push("Informe seu CEP.");
        }
        else if (cep.length !== 8) {
            erros.push("O CEP deve conter 8 dígitos.");
        }
        else {
            try {
                const cepValido = yield (0, cep_validator_1.validarCEP)(cep);
                if (!cepValido) {
                    erros.push("Informe um CEP válido.");
                }
            }
            catch (_a) {
                erros.push("Não foi possível verificar o CEP. Tente novamente.");
            }
        }
        // E-mail
        if (!email) {
            erros.push("Digite seu e-mail.");
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            erros.push("Informe um e-mail válido.");
        }
        // Senha: reutiliza o validador existente
        erros.push(...(0, senha_validator_1.validarSenha)(senha));
        // Confirmação de senha
        if (!confirmaSenha) {
            erros.push("Confirme sua senha.");
        }
        else if (confirmaSenha !== senha) {
            erros.push("As senhas não conferem.");
        }
        return erros;
    });
}
//# sourceMappingURL=cadastro.validator.js.map