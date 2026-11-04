//Por: Murilo Lopes - 26894964

const API_BASE_URL = "http://localhost:3000";

// Busca na API os dados principais de uma demanda pelo ID.
async function detalhesDemandaApi(id) {
  const url = `${API_BASE_URL}/demanda/${encodeURIComponent(id)}`;
  const resposta = await fetch(url);
  return tratarRespostaApi(resposta);
}

// Busca na API o histórico de alterações de uma demanda pelo ID.
async function historicoDemandaApi(id) {
  const url = `${API_BASE_URL}/demanda/${encodeURIComponent(id)}/historico`;
  const resposta = await fetch(url);
  return tratarRespostaApi(resposta);
}

// Envia à API a solicitação para atualizar o status da demanda.
async function alterarStatusDemandaApi(id, status) {
  const url = `${API_BASE_URL}/demanda/${encodeURIComponent(id)}/status`;

  const resposta = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  return tratarRespostaApi(resposta);
}

// Converte a resposta da API em dados e transforma respostas de erro em exceções.
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
