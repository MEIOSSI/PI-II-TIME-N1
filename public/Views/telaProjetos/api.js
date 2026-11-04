//por Valentina Bastos - 26893594

const API_BASE_URL = "http://localhost:3000";

async function listarProjetosApi() {
  const resposta = await fetch(`${API_BASE_URL}/projetos`);
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