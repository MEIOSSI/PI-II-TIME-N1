
export function validarSenha(senha: string): string[] {
  const erros: string[] = [];

  if (!senha) {
    erros.push("Digite sua senha.");
    return erros;
  }

  if (senha.length < 8) {
    erros.push("A senha deve conter pelo menos 8 caracteres.");
  }

  if (!/[A-Z]/.test(senha)) {
    erros.push("A senha precisa de uma letra maiúscula.");
  }

  if (!/[a-z]/.test(senha)) {
    erros.push("A senha precisa de uma letra minúscula.");
  }

  if (!/[0-9]/.test(senha)) {
    erros.push("A senha precisa de um número.");
  }

  if (!/[_@!]/.test(senha)) {
    erros.push("A senha precisa de um caractere especial: _, @ ou !.");
  }

  return erros;
}
