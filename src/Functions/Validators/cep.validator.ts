
interface RespostaViaCEP {
  cep?: string;
  erro?: boolean | string;
}

export async function validarCEP(cep: string): Promise<boolean> {
  const numeros = cep.replace(/\D/g, "");

  // Primeiro, verifica o formato
  if (numeros.length !== 8) {
    return false;
  }

  const resposta = await fetch(
    `https://viacep.com.br/ws/${numeros}/json/`
  );

  if (!resposta.ok) {
    throw new Error("Não foi possível consultar o CEP.");
  }

  const dados = (await resposta.json()) as RespostaViaCEP;

  // O ViaCEP retorna erro quando o CEP não existe
  if (dados.erro) {
    return false;
  }

  return true;
}
