const API_BASE_URL = "http://localhost:3000";

//tela projetos
async function listarProjetosApi() {
  const resposta = await fetch(`${API_BASE_URL}/projetos`);
  return tratarRespostaApi(resposta);
}

async function listarDemandasApi(idProjeto) {
  const url = `${API_BASE_URL}/projetos/${encodeURIComponent(idProjeto)}/demandas`;
  const resposta = await fetch(url);
  return tratarRespostaApi(resposta);
}

//tela detalhes de demanda
async function detalhesDemandaApi(id) {
  const url = `${API_BASE_URL}/demanda/${encodeURIComponent(id)}`;
  const resposta = await fetch(url);
  return tratarRespostaApi(resposta);
}

async function historicoDemandaApi(id) {
  const url = `${API_BASE_URL}/demanda/${encodeURIComponent(id)}/historico`;
  const resposta = await fetch(url);
  return tratarRespostaApi(resposta);
}

async function alterarStatusDemandaApi(id, status) {
  const url = `${API_BASE_URL}/demanda/${encodeURIComponent(id)}/status`;

  const resposta = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  return tratarRespostaApi(resposta);
}

//função de tratar as resposta da api (verifica se é json)
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
    const mensagem =
      dados.erro || dados.mensagem || dados.msg || "Erro na requisição.";
    throw new Error(mensagem);
  }

  return dados;
} 