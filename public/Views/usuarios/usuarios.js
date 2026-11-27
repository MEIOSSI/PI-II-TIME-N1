const idProjeto = window.location.pathname.split("/").filter(Boolean).at(-2);

const rotulosCargo = {
    LIDER_DE_PROJETO: "Líder do projeto",
    MEMBRO_DA_EQUIPE: "Membro da equipe"
};

function mostrarMensagem(mensagem, erro = false) {
    const elemento = document.getElementById("mensagemUsuarios");
    elemento.className = erro ? "alert alert-danger" : "text-muted";
    elemento.textContent = mensagem;
}

function criarCardUsuario(usuario) {
    const card = document.createElement("article");
    card.className = "card";

    const perfil = document.createElement("div");
    perfil.className = "perfil";

    const avatar = document.createElement("div");
    avatar.className = "avatar azul";
    avatar.textContent = usuario.NOME.trim().charAt(0).toUpperCase();

    const dados = document.createElement("div");
    const nome = document.createElement("h2");
    nome.textContent = usuario.NOME;

    const cargo = document.createElement("p");
    cargo.className = "cargo";
    cargo.textContent = rotulosCargo[usuario.CARGO] ?? usuario.CARGO;

    dados.append(nome, cargo);
    perfil.append(avatar, dados);

    const email = document.createElement("p");
    email.className = "responsabilidade";
    email.textContent = usuario.EMAIL;

    card.append(perfil, email);
    return card;
}

async function carregarUsuariosProjeto() {
    const lista = document.getElementById("listaUsuarios");

    if (!/^\d+$/.test(idProjeto ?? "")) {
        mostrarMensagem("ID do projeto inválido.", true);
        return;
    }

    try {
        const resposta = await fetch(`/api/projetos/${encodeURIComponent(idProjeto)}/usuarios`);
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Não foi possível carregar os integrantes.");
        }

        document.getElementById("nomeProjeto").textContent = dados.projeto.TITULO;
        document.getElementById("quantidadeUsuarios").textContent =
            `${dados.usuarios.length} integrante${dados.usuarios.length === 1 ? "" : "s"}`;

        lista.replaceChildren(...dados.usuarios.map(criarCardUsuario));
        if (dados.usuarios.length === 0) {
            mostrarMensagem("Este projeto ainda não tem integrantes cadastrados.");
        }
    } catch (erro) {
        mostrarMensagem(erro.message, true);
    }
}

window.addEventListener("DOMContentLoaded", carregarUsuariosProjeto);
