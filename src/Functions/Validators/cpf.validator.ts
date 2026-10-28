
export function validarCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, "");

  // Precisa ter 11 dígitos
  if (numeros.length !== 11) {
    return false;
  }

  // Rejeita sequências como 11111111111
  if (/^(\d)\1{10}$/.test(numeros)) {
    return false;
  }

  // Calcula o primeiro dígito verificador
  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(numeros[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;
  const primeiroDigito = resto === 10 ? 0 : resto;

  if (primeiroDigito !== Number(numeros[9])) {
    return false;
  }

  // Calcula o segundo dígito verificador
  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(numeros[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;
  const segundoDigito = resto === 10 ? 0 : resto;

  if (segundoDigito !== Number(numeros[10])) {
    return false;
  }

  return true;
}
