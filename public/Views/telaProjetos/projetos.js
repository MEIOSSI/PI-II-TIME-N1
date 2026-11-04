//por Valentina Bastos - 26893594

async function carregarProjetos() {
    try {

        const dados = await listarProjetosApi();
        await renderizarUsuario(dados.usuario);
        await renderizarCardProjeto(dados.projetos);
        
    } catch (erro) {
        exibirMensagemLista("danger", erro.message);
    }
    
}

async function renderizarCardProjeto(projetos) {
    const projetoListado = document.getElementById("listar_projeto");

    if (!projetoListado) {
        throw new Error('Elemento "listar_projeto" não encontrado na página.');
    }

    projetoListado.innerHTML = "";

    if (!Array.isArray(projetos) || projetos.length === 0) {
        projetoListado.innerHTML = `
        <div class="pt-5 sem-projetos">
            <h3>Você ainda não participa de nenhum projeto.</h3>
        </div>`
        return;
    }

    projetos.forEach((projeto) => {

        projetoListado.innerHTML+= `
        <div class="col-12 col-md-9 mb-3">
            <div class="projeto card w-100 p-3">
                <div class="d-flex justify-content-between align-items-center">
                    <h4 class="mb-0 fw-bold" id="nome_projeto">${projeto.TITULO}</h4>
                    <button class="btn btn-primary irpara" data-projeto-id="${projeto.ID_PROJETO}">Ir para Dashboard
                        <img class="icon-ir" src="../../icons/arrow-right-solid.png" alt="">
                    </button>
                </div>
                <div class="row">
                    <p class="p-3">
                        ${projeto.QUANTIDADE_DEMANDAS > 0
                            ? `Você tem <b>${projeto.QUANTIDADE_DEMANDAS}</b> demandas abertas ou em andamento atribuídas a você neste projeto.`
                            : "Você não tem demandas abertas ou em andamento atribuídas a você neste projeto."}
                    </p>
                </div>
            </div>
        </div>
        `;
        
    });

}

async function renderizarUsuario(usuario) {
    const nomeUser = document.getElementById("nomeUsuario")
    const perfil =document.getElementById("perfilUsuario")
    const inicialUser =document.getElementById("iniciaisUsuario")

    nomeUser.textContent = usuario.NOME;
    perfil.textContent = usuario.PERFIL.toLowerCase();
    inicialUser.textContent =usuario.NOME.trim().charAt(0).toUpperCase();
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

document.getElementById("listar_projeto")?.addEventListener("click", (evento) => {
    const alvo = evento.target;
    if (!(alvo instanceof Element)) return;

    const botao = alvo.closest(".irpara");
    if (!(botao instanceof HTMLButtonElement)) return;

    const idProjeto = botao.dataset.projetoId;
    window.location.href =
        `../telaDemandas/demandas.html?id=${encodeURIComponent(idProjeto)}`;
});

window.addEventListener("DOMContentLoaded", carregarProjetos);

