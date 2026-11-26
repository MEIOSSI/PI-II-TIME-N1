//por Valentina Bastos - 26893594

//url base
const API_BASE_URL = "http://localhost:3000";

//fução que lista as demandas, considerando também ps filtros ativos
async function listarDemandasApi(idProjeto, prioridade = "", tipo = "", apenasMinhasDemandas = false, pesquisa = "") {
  const url = new URL(`${API_BASE_URL}/projetos/${encodeURIComponent(idProjeto)}/demandas`);

  if (prioridade) url.searchParams.set("prioridade", prioridade);
  if (tipo) url.searchParams.set("tipo", tipo);
  if (apenasMinhasDemandas) url.searchParams.set("apenasMinhasDemandas", "true");
  if (pesquisa.trim()) url.searchParams.set("pesquisa", pesquisa.trim());

  const resposta = await fetch(url.toString());
  return tratarRespostaApi(resposta);
}

//função que verifica se a resposta recebida é um JSON
async function tratarRespostaApi(resposta) {
  // Lê o tipo de conteúdo retornado pela API
  const tipoConteudo = resposta.headers.get("content-type") || "";

  // Interrompe se a resposta não for JSON e informa possíveis causas
  if (!tipoConteudo.includes("application/json")) {
    throw new Error(
      `A API respondeu ${resposta.status} com ${tipoConteudo || "conteúdo desconhecido"}. ` +
      `Confira se o servidor está rodando em ${API_BASE_URL} e abra a tela pelo Express.`
    );
  }

  const dados = await resposta.json();

  if (!resposta.ok) {
    const mensagem = dados.erro || dados.mensagem || dados.msg || "Erro na requisição.";
    throw new Error(mensagem);
  }
  //Se for um JSON, retorna a resposta
  return dados;
}
