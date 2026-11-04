//por Valentina Bastos - 26893594

const parametros = new URLSearchParams(window.location.search);
const idProjeto = parametros.get("id");

if (!idProjeto) {
    console.error("ID do projeto não foi informado.");
}

async function carregarDemandas() {
    try {
        const dados = await listarDemandasApi();

        renderizarNomeProjeto(dados.nomeProjeto?.[0]?.TITULO); // ?.[0]  tenta pegar o primeiro resultado, sem gerar erro se a lista estiver ausente.
        //?.TITULO tenta ler a propriedade TITULO, também sem gerar erro se o resultado não existir.
        renderizarDemandas(dados.demandas);
        renderizarUsuario(dados.usuario);
    } catch (erro) {
        exibirMensagemLista("danger", erro.message);
    }
    
}

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
        if (!coluna) return;

        coluna.insertAdjacentHTML("beforeend", `
            ${criarLinhaPrioridade(demanda.PRIORIDADE)}
                <div class="card-body">
                    <div class="mb-2 nome-demanda">${demanda.TITULO}</div>
                    <div class="d-flex gap-2 mb-2">
                        ${criarBadgeTipo(demanda.TIPO)}
                        ${criarBadgePrioridade(demanda.PRIORIDADE)}
                    </div>
                    <p class="small text-muted mb-0">
                        ${demanda.RESPONSAVEL || "Sem responsável"}
                    </p>
                </div>
            </article>
        `);
    });
}

function renderizarNomeProjeto(nome) {
    document.getElementById("nomeProjeto").textContent = nome || "Demanda sem nome";
}

function renderizarUsuario(usuario) {
    const nomeUser = document.getElementById("nomeUsuario")
    const perfil =document.getElementById("perfilUsuario")

    nomeUser.textContent = usuario.NOME;
    perfil.textContent = usuario.PERFIL.toLowerCase();
}

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

function criarLinhaPrioridade(PRIORIDADE){
    if (PRIORIDADE === "CRITICA"){
        return `<article class="card mb-3 shadow-sm demanda-card critica">`
    }

    if (PRIORIDADE === "ALTA"){
        return `<article class="card mb-3 shadow-sm demanda-card alta">`
    }

        if (PRIORIDADE === "MEDIA"){
        return `<article class="card mb-3 shadow-sm demanda-card media">`
    }

        if (PRIORIDADE === "BAIXA"){
        return `<article class="card mb-3 shadow-sm demanda-card baixa">`
    }

    return `<article class="card mb-3 shadow-sm demanda-card critica">`

}

function exibirMensagemLista(tipo, mensagem) {
  const areaMensagem = document.getElementById("areaMensagem");

  if (!areaMensagem) {
    console.error(mensagem);
    return;
  }

  areaMensagem.className = `alert alert-${tipo}`;
  areaMensagem.innerHTML = mensagem;
}

window.addEventListener("DOMContentLoaded", carregarDemandas);