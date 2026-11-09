// por: Vitor Hugo Turati Ianagui - <RA>

import { validarSenha } from "./senha.validator";
import { REGEX_EMAIL } from "./login.validator";

export interface DadosRedefinicao {
    email: string;
    senhaAtual: string;
    novaSenha: string;
    confirmaNovaSenha: string;
}

export function validarRedefinicao(dados: DadosRedefinicao): string[] {
    const erros: string[] = [];
    const email = dados.email.trim();

    if (!email) {
        erros.push("Informe seu e-mail.");
    } else if (!REGEX_EMAIL.test(email)) {
        erros.push("Informe um e-mail válido.");
    }

    if (!dados.senhaAtual) {
        erros.push("Digite sua senha atual.");
    }

    // Mesmas regras do cadastro
    erros.push(...validarSenha(dados.novaSenha));

    if (!dados.confirmaNovaSenha) {
        erros.push("Confirme sua nova senha.");
    } else if (dados.confirmaNovaSenha !== dados.novaSenha) {
        erros.push("As senhas não conferem.");
    }

    if (dados.novaSenha && dados.novaSenha === dados.senhaAtual) {
        erros.push("A nova senha deve ser diferente da senha atual.");
    }

    return erros;
}