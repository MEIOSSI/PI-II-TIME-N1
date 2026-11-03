const API_BASE_URL = "http://localhost:3000";

async function listarProjetosApi() {
    let url = `${API_BASE_URL}/projetos`;

    const resposta = await fetch(url);
    return await tratarRespostaApi(resposta);
}

async function listarDemandasApi() {
  let url = `${API_BASE_URL}/projetos/${encodeURIComponent(idProjeto)}/demandas`;

  const resposta = await fetch(url);
  return await tratarRespostaApi(resposta);
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

  if(!resposta.ok){
    const mensagem = dados.erro || dados.mensagem || "Erro na requisição.";
    throw new Error(mensagem); //lançamento de sessão, programa para
  }

  return dados;
}
