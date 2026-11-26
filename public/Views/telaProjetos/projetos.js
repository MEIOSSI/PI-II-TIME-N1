//por Valentina Bastos - 26893594

//fução de carregar tanto os projetos do usuário quanto o perfil
async function carregarProjetos() {
    try {

        const dados = await listarProjetosApi();
        await renderizarUsuario(dados.usuario);
        //Se o perfil logado for administrador, retorna true
        const ehAdministrador = dados.usuario.PERFIL === "ADMINISTRADOR";
        await renderizarCardProjeto(dados.projetos, ehAdministrador);
        
    } catch (erro) {
        exibirMensagemLista("danger", erro.message);
    }
    
}

//função que renderiza os projetos do usuário
async function renderizarCardProjeto(projetos, ehAdministrador) {
    const projetoListado = document.getElementById("listar_projeto");

    projetoListado.innerHTML = "";

    //Se o usuário não participar de nenhum projeto, retorna uma mensagem
    if (!Array.isArray(projetos) || projetos.length === 0) {
        projetoListado.innerHTML = `
        <div class="pt-5 sem-projetos">
            <h3>Você ainda não participa de nenhum projeto.</h3>
        </div>`
        return;
    }

    //Renderiza os cards de projeto
    //Se o usuário for administrador, aparece também o botão de ver usuários daquele projeto
    projetos.forEach((projeto) => {

        projetoListado.innerHTML+= `
        <div class="col-12 col-md-9 mb-3">
            <div class="projeto card w-100 p-3">
                <div class="d-flex justify-content-between align-items-center">
                    <h4 class="mb-0 fw-bold" id="nome_projeto">${projeto.TITULO}</h4>
                    <div class="d-flex flex-wrap gap-2">
                        ${ehAdministrador ? `<a class="btn btn-outline-primary" href="/projetos/${encodeURIComponent(projeto.ID_PROJETO)}/usuarios">Ver integrantes</a>` : ""}
                        <a class="btn btn-primary irpara" href="/demandas?id=${encodeURIComponent(projeto.ID_PROJETO)}">Ir para Demandas
                            <img class="icon-ir" src="../../icons/arrow-right-solid.png" alt="">
                        </a>
                    </div>
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

//função que renderiza o nome e perfil do usuário logado
async function renderizarUsuario(usuario) {
    const nomeUser = document.getElementById("nomeUsuario")
    const perfil =document.getElementById("perfilUsuario")
    const inicialUser =document.getElementById("iniciaisUsuario")

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
    
    inicialUser.textContent =usuario.NOME.trim().charAt(0).toUpperCase();
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

window.addEventListener("DOMContentLoaded", () => {
    carregarProjetos();

    //Quando clicar no item de sair do menu, desloga o usuário
    document.querySelector(".menu-item.sair")?.addEventListener("click", async (evento) => {
        evento.preventDefault();

        try {
            const resposta = await fetch("/api/auth/logout", { method: "POST" });
            if (!resposta.ok) throw new Error("Não foi possível encerrar a sessão.");

            window.location.href = "/";
        } catch (erro) {
            exibirMensagemLista("danger", erro.message);
        }
    });
});
