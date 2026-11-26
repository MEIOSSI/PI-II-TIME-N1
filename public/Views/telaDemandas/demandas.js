//por Valentina Bastos - 26893594

//Pegando o id do projeto
const parametros = new URLSearchParams(window.location.search);
const idProjeto = parametros.get("id");

if (!idProjeto) {
    console.error("ID do projeto não foi informado.");
}

async function carregarDemandas(dadosRecebidos = null) {
    try {
        const dados = dadosRecebidos ?? await listarDemandasApi(idProjeto);

        renderizarNomeProjeto(dados.nomeProjeto?.[0]?.TITULO); // ?.[0]  tenta pegar o primeiro resultado, sem gerar erro se a lista estiver ausente.
        //?.TITULO tenta ler a propriedade TITULO, também sem gerar erro se o resultado não existir.
        // Remove os cards atuais para evitar duplicá-los ao atualizar a lista
        document.querySelectorAll("[data-status] .demanda-card").forEach((card) => card.remove());

        renderizarDemandas(dados.demandas);
        renderizarUsuario(dados.usuario);
        renderizarBotaoNovaDemanda(dados.usuario.PERFIL);
    } catch (erro) {
        exibirMensagemLista("danger", erro.message);
    }
    
}

//função de renderizar as demandas do projeto
function renderizarDemandas(demandas) {
    const colunas = {
        "ABERTA": document.querySelector('[data-status="ABERTA"]'),
        "EM ANDAMENTO": document.querySelector('[data-status="EM ANDAMENTO"]'),
        "EM REVISAO": document.querySelector('[data-status="EM REVISAO"]'),
        "CONCLUIDA": document.querySelector('[data-status="CONCLUIDA"]'),
        "CANCELADA": document.querySelector('[data-status="CANCELADA"]')
    };

    demandas.forEach((demanda) => {
        const coluna = colunas[demanda.STATUS];
        // Ignora a demanda se não houver uma coluna correspondente ao status
        if (!coluna) return;

        // Acrescenta o card da demanda ao final da coluna do seu status
        coluna.insertAdjacentHTML("beforeend", `
            ${criarLinhaPrioridade(demanda.PRIORIDADE, demanda.ID_DEMANDA)}
                <div class="card-body">
                    <div class="mb-2 nome-demanda">${demanda.TITULO}</div>
                    <div class="d-flex flex-wrap gap-2 mb-2">
                        ${criarBadgeTipo(demanda.TIPO)}
                        ${criarBadgePrioridade(demanda.PRIORIDADE)}
                    </div>
                    <p class="small text-muted mb-0">
                        ${demanda.RESPONSAVEL || "Sem responsável"}
                    </p>
                    <div>
                        <p class="small text-muted mb-0">
                            ${formatarData(demanda.DATA_CRIACAO)} - ${formatarData(demanda.PRAZO_FINAL)}</p>
                    </div>
                </div>
            </article>
        `);
    });
}

//função de formatar datas da demanda
function formatarData(valor) {
    if (!valor) return "—";

    // ^ marca o início e $ o fim; \d corresponde a um dígito
    // {4} e {2} definem quantos dígitos; (...) captura ano, mês e dia, separados por hífens
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valor));

    // Se não houver correspondência, devolve o valor original como texto
    if (!partes) return String(valor);

    return `${partes[3]}/${partes[2]}/${partes[1]}`; //Devolve a data em dia/mês/ano
}

//função que carrega o botão de nova demanda
function renderizarBotaoNovaDemanda(perfil){
    const container = document.getElementById("botaodemanda");
    const perfilNormalizado = perfil?.trim().toUpperCase();

    //Verifica se o perfil logado é de líder ou adm
    if (perfilNormalizado === "LIDER_DE_PROJETO" || perfilNormalizado === "ADMINISTRADOR") {
        container.innerHTML = `
            <div class="btn-nova-demanda">
                <a class="btn btn-primary aplicar mb-3" id="novaDemanda" href="/Views/cadastroDemanda/index.html?projetoId=${encodeURIComponent(idProjeto)}">
                    <span class="fw-bold">+ </span>Nova Demanda
                </a>
            </div>
        `;
    }
}

//função que renderiza o nome do projeto, caso ele exista
function renderizarNomeProjeto(nome) {
    nomeProjeto = document.getElementById("nomeProjeto");

    if(nome){
        nomeProjeto.textContent = nome
    } else {
        nomeProjeto.textContent = "Projeto não existe"
    }
}

//função que renderiza nome e perfil do usuário
function renderizarUsuario(usuario) {
    const nomeUser = document.getElementById("nomeUsuario")
    const perfil =document.getElementById("perfilUsuario")

    nomeUser.textContent = usuario.NOME;

    if (usuario.PERFIL === "ADMINISTRADOR"){
        perfil.textContent = "Administrador";
    }

        if (usuario.PERFIL === "LIDER_DE_PROJETO"){
        perfil.textContent = "Líder";
    }

        if (usuario.PERFIL === "MEMBRO_DA_EQUIPE"){
        perfil.textContent = "Membro";
    }
}

//função que altera texto e estilo da badge de prioridade
function criarBadgePrioridade(PRIORIDADE){
    if (PRIORIDADE === "CRITICA"){
        return `<div class="prioridade-critica">Crítica</div>`
    }

    if (PRIORIDADE === "ALTA"){
        return `<div class="prioridade-alta">Alta</div>`
    }

        if (PRIORIDADE === "MEDIA"){
        return `<div class="prioridade-media">Média</div>`
    }

        if (PRIORIDADE === "BAIXA"){
        return `<div class="prioridade-baixa">Baixa</div>`
    }

    return `<div class="prioridade-alta">ERRO</div>`

}

//função que altera texto e estilo da badge de tipo
function criarBadgeTipo(TIPO){
    if (TIPO === "DOCUMENTACAO"){
        return `<div class="tipo-documentacao">Documentação</div>`
    }

    if (TIPO === "MELHORIA"){
        return `<div class="tipo-melhoria">Melhoria</div>`
    }

    if (TIPO === "DEFEITO"){
        return `<div class="tipo-defeito">Defeito</div>`
    }

    if (TIPO === "TAREFA"){
        return `<div class="tipo-tarefa">Tarefa</div>`
    }

     return `<div class="tipo-tarefa">ERRO</div>`
}

//função que cria uma linhazinha colorida com a cor de acordo com a priorizade da demanda
function criarLinhaPrioridade(PRIORIDADE, idDemanda){
    if (PRIORIDADE === "CRITICA"){
        return `<article class="card mb-3 shadow-sm demanda-card critica" data-demanda-id="${encodeURIComponent(idDemanda)}">`
    }

    if (PRIORIDADE === "ALTA"){
        return `<article class="card mb-3 shadow-sm demanda-card alta" data-demanda-id="${encodeURIComponent(idDemanda)}">`
    }

        if (PRIORIDADE === "MEDIA"){
        return `<article class="card mb-3 shadow-sm demanda-card media" data-demanda-id="${encodeURIComponent(idDemanda)}">`
    }

        if (PRIORIDADE === "BAIXA"){
        return `<article class="card mb-3 shadow-sm demanda-card baixa" data-demanda-id="${encodeURIComponent(idDemanda)}">`
    }

    return `<article class="card mb-3 shadow-sm demanda-card critica" data-demanda-id="${encodeURIComponent(idDemanda)}">`
}

//função que aplica os filtros nas demandas
async function aplicarFiltros() {
    try {
        // Lê a prioridade escolhida; sem seleção, usa vazio para não filtrar por prioridade
        const prioridade =
            document.querySelector('input[name="prioridade"]:checked')?.value ?? "";
        // Lê o tipo escolhido; sem seleção, usa vazio para não filtrar por tipo
        const tipo =
            document.querySelector('input[name="tipo"]:checked')?.value ?? "";
        // Verifica se o checkbox para mostrar apenas as demandas do usuário está marcado
        const apenasMinhasDemandas =
            document.querySelector('input[name="minhas-demandas"]').checked;

        const dados = await listarDemandasApi(
            idProjeto,
            prioridade,
            tipo,
            apenasMinhasDemandas
        );

        await carregarDemandas(dados);
    } catch (erro) {
        exibirMensagemLista("danger", erro.message);
    }
}

//função que faz a pesquisa funcionar
async function pesquisarDemandas() {
    try {
        const pesquisa = document.getElementById("pesquisaDemandas").value;
        const dados = await listarDemandasApi(idProjeto, "", "", false, pesquisa);

        await carregarDemandas(dados);
    } catch (erro) {
        exibirMensagemLista("danger", erro.message);
    }
}

//função que limpa os filtros e a pesquisa
function limparFiltros() {
    //Pega os valores atuais dos filtros e da pesquisa
  const prioridadeInputs = document.querySelectorAll('input[name="prioridade"]');
  const tipoInputs = document.querySelectorAll('input[name="tipo"]');
  const minhasDemandasInput = document.getElementById("minhasDemandas");
  const campoBusca = document.getElementById("pesquisaDemandas");

  //Deixa todos os filtros sem nada ativado e limpa a barra de pesquisa
  prioridadeInputs.forEach((input) => {
    input.checked = false;
  });

  tipoInputs.forEach((input) => {
    input.checked = false;
  });

  if (minhasDemandasInput) {
    minhasDemandasInput.checked = false;
  }

  if (campoBusca) {
    campoBusca.value = "";
  }

  carregarDemandas();
}

//função de exibir mensagem em caso de erro
function exibirMensagemLista(tipo, mensagem) {
  const areaMensagem = document.getElementById("areaMensagem");

  if (!areaMensagem) {
    console.error(mensagem);
    return;
  }

  areaMensagem.className = `alert alert-${tipo}`;
  areaMensagem.innerHTML = mensagem;
}

// Aguarda o HTML ser carregado antes de configurar os eventos da página
document.addEventListener("DOMContentLoaded", () => {
    // Escuta cliques no documento para funcionar também nos cards criados
    document.addEventListener("click", (evento) => {
        if (!(evento.target instanceof Element)) return;

        // Encontra o card de demanda mais próximo do elemento clicado
        const card = evento.target.closest(".demanda-card[data-demanda-id]");
        if (!card) return;

        // Abre a página de detalhes usando o ID da demanda armazenado no card
        window.location.href = `/detalhes/${card.dataset.demandaId}`;
    });

    carregarDemandas();
});
