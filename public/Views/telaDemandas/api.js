//por Valentina Bastos - 26893594

const API_BASE_URL = "http://localhost:3000";

async function listarDemandasApi(idProjeto, prioridade = "", tipo = "", apenasMinhasDemandas = false, pesquisa = "") {
  const url = new URL(`${API_BASE_URL}/projetos/${encodeURIComponent(idProjeto)}/demandas`);

  if (prioridade) url.searchParams.set("prioridade", prioridade);
  if (tipo) url.searchParams.set("tipo", tipo);
  if (apenasMinhasDemandas) url.searchParams.set("apenasMinhasDemandas", "true");
  if (pesquisa.trim()) url.searchParams.set("pesquisa", pesquisa.trim());

  const resposta = await fetch(url.toString());
  return tratarRespostaApi(resposta);
}

async function tratarRespostaApi(resposta) {
  const tipoConteudo = resposta.headers.get("content-type") || "";

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

  return dados;
}
