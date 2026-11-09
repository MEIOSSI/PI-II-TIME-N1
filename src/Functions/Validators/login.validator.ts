// por: Vitor Hugo Turati Ianagui - <26025950>

export interface DadosLogin {
    email: string;
    senha: string;
}

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarLogin(dados: DadosLogin): string[] {
    const erros: string[] = [];
    const email = dados.email.trim();

    if (!email) {
        erros.push("Informe seu e-mail.");
    } else if (!REGEX_EMAIL.test(email)) {
        erros.push("Informe um e-mail válido.");
    }

    if (!dados.senha) {
        erros.push("Digite sua senha.");
    }

    return erros;
}