
import { validarSenha } from "./senha.validator";
import { validarCPF } from "./cpf.validator";
import { validarCEP } from "./cep.validator";

interface DadosCadastro {
  nome: string;
  cpf: string;
  telefone: string;
  endereco: string;
  cep: string;
  email: string;
  senha: string;
  confirmaSenha: string;
}

export async function validarCadastro(
  dados: DadosCadastro
): Promise<string[]> {
  const erros: string[] = [];

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
  } else if (nome.length < 5) {
    erros.push("O nome deve possuir pelo menos 5 caracteres.");
  } else if (nome.split(/\s+/).length < 2) {
    erros.push("Informe nome e sobrenome.");
  }

  // CPF: formato e quantidade de dígitos
    if (!cpf) {
      erros.push("Informe seu CPF.");
    } else if (!validarCPF(cpf)) {
      erros.push("Informe um CPF válido.");
    }

  // Telefone
  if (!telefone) {
    erros.push("Informe um número de telefone.");
  } else if (telefone.length < 10 || telefone.length > 11) {
    erros.push("O telefone deve conter 10 ou 11 dígitos.");
  }

  // Endereço
  if (!endereco) {
    erros.push("Informe seu endereço.");
  }

  // CEP
  if (!cep) {
  erros.push("Informe seu CEP.");
} else if (cep.length !== 8) {
  erros.push("O CEP deve conter 8 dígitos.");
} else {
  try {
    const cepValido = await validarCEP(cep);

    if (!cepValido) {
      erros.push("Informe um CEP válido.");
    }
  } catch {
    erros.push("Não foi possível verificar o CEP. Tente novamente.");
  }
}

  // E-mail
  if (!email) {
    erros.push("Digite seu e-mail.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erros.push("Informe um e-mail válido.");
  }

  // Senha: reutiliza o validador existente
  erros.push(...validarSenha(senha));

  // Confirmação de senha
  if (!confirmaSenha) {
    erros.push("Confirme sua senha.");
  } else if (confirmaSenha !== senha) {
    erros.push("As senhas não conferem.");
  }

  return erros;
}
