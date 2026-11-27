
// por: Camille Chagas - 26895813

// Endereço - API
const API_BASE_URL = "http://localhost:3000";

let demandas = [];


const nomesStatus = {
    "ABERTA": "Aberta",
    "EM ANDAMENTO": "Em andamento",
    "EM REVISAO": "Em revisão",
    "CONCLUIDA": "Concluída",
    "CANCELADA": "Cancelada"
};


const nomesPrioridade = {
    "CRITICA": "Crítica",
    "ALTA": "Alta",
    "MEDIA": "Média",
    "BAIXA": "Baixa"
};


const nomesTipo = {
    "TAREFA": "Tarefa",
    "DEFEITO": "Defeito",
    "MELHORIA": "Melhoria",
    "DOCUMENTACAO": "Documentação"
};


function normalizar(valor) {
    return String(valor ?? "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/_/g, " ")
        .toUpperCase();
}


// Buscar campo - nomes diferentes
function obterCampo(objeto, nomes) {

    for (const nome of nomes) {

        if (objeto[nome] !== undefined && objeto[nome] !== null) {
            return objeto[nome];
        }

    }

    return null;
}


// Formatar datas - padrão 
function formatarData(valor) {

    if (!valor) return "—";

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return String(valor);
    }

    return new Intl.DateTimeFormat("pt-BR").format(data);
}

function obterUsuarioLogado() {
    // Obter usuario logado que esta em session storage
    const usuarioSession = sessionStorage.getItem("usuario")

    // transformar objeto em formato JSON
    return JSON.parse(usuarioSession)
}

async function renderizarUsuario() {
    const nomeUser = document.getElementById("nomeUsuario")
    const perfil = document.getElementById("perfilUsuario")

    const usuario = obterUsuarioLogado()

    nomeUser.textContent = usuario.nome;

    if (usuario.perfil === "ADMINISTRADOR") {
        perfil.textContent = "Administrador";
    }

    if (usuario.perfil === "LIDER_DE_PROJETO") {
        perfil.textContent = "Líder";
    }

    if (usuario.perfil === "MEMBRO_DA_EQUIPE") {
        perfil.textContent = "Membro";
    }
}

function mostrarMensagem(mensagem, tipo = "danger") {

    let areaMensagem = document.getElementById("mensagemDashboard");

    if (!areaMensagem) {

        areaMensagem = document.createElement("div");
        areaMensagem.id = "mensagemDashboard";
        areaMensagem.className = "alert mt-3";

        const conteudo = document.querySelector("main");

        if (conteudo) {
            conteudo.prepend(areaMensagem);
        }

    }

    areaMensagem.className = `alert alert-${tipo} mt-3`;
    areaMensagem.textContent = mensagem;
}


// Retornar status
function obterStatus(demanda) {

    return normalizar(
        obterCampo(demanda, ["STATUS", "status"])
    );

}


// Retornar prioridade - demanda
function obterPrioridade(demanda) {

    return normalizar(
        obterCampo(demanda, ["PRIORIDADE", "prioridade"])
    );

}


// Retornar tipo de uma demanda
function obterTipo(demanda) {

    return normalizar(
        obterCampo(demanda, ["TIPO", "tipo"])
    );

}


function contarStatus(status) {

    return demandas.filter((demanda) => {
        return obterStatus(demanda) === status;
    }).length;

}


function contarPrioridade(prioridade) {

    return demandas.filter((demanda) => {
        return obterPrioridade(demanda) === prioridade;
    }).length;

}


function contarTipo(tipo) {

    return demandas.filter((demanda) => {
        return obterTipo(demanda) === tipo;
    }).length;

}


// Atualizando cards - quantidade de demandas
function atualizarCards() {

    document.getElementById("totalDemandas").textContent =
        demandas.length;

    document.getElementById("demandasAbertas").textContent =
        contarStatus("ABERTA");

    document.getElementById("demandasAndamento").textContent =
        contarStatus("EM ANDAMENTO");

    document.getElementById("demandasRevisao").textContent =
        contarStatus("EM REVISAO");

    document.getElementById("demandasConcluidas").textContent =
        contarStatus("CONCLUIDA");

    document.getElementById("demandasCanceladas").textContent =
        contarStatus("CANCELADA");

}


// Atualiza indicadores
function atualizarPrioridades() {

    const critica = contarPrioridade("CRITICA");
    const alta = contarPrioridade("ALTA");
    const media = contarPrioridade("MEDIA");
    const baixa = contarPrioridade("BAIXA");

    document.getElementById("prioridadeCritica").textContent = critica;
    document.getElementById("prioridadeAlta").textContent = alta;
    document.getElementById("prioridadeMedia").textContent = media;
    document.getElementById("prioridadeBaixa").textContent = baixa;

    const total = demandas.length;

    document.getElementById("barraCritica").style.width =
        total > 0 ? `${(critica / total) * 100}%` : "0%";

    document.getElementById("barraAlta").style.width =
        total > 0 ? `${(alta / total) * 100}%` : "0%";

    document.getElementById("barraMedia").style.width =
        total > 0 ? `${(media / total) * 100}%` : "0%";

    document.getElementById("barraBaixa").style.width =
        total > 0 ? `${(baixa / total) * 100}%` : "0%";

}


// Atualizando indicadores
function atualizarTipos() {

    document.getElementById("tipoTarefa").textContent =
        contarTipo("TAREFA");

    document.getElementById("tipoDefeito").textContent =
        contarTipo("DEFEITO");

    document.getElementById("tipoMelhoria").textContent =
        contarTipo("MELHORIA");

    document.getElementById("tipoDocumentacao").textContent =
        contarTipo("DOCUMENTACAO");

}


function listarDemandasCriticas() {

    const lista = document.getElementById("listaDemandasCriticas");

    lista.replaceChildren();

    const demandasCriticas = demandas.filter((demanda) => {

        return obterPrioridade(demanda) === "CRITICA"
            && obterStatus(demanda) === "ABERTA";

    });

    if (demandasCriticas.length === 0) {

        const mensagem = document.createElement("p");
        mensagem.className = "text-muted";
        mensagem.textContent = "Nenhuma demanda crítica em aberto.";

        lista.appendChild(mensagem);
        return;

    }

    demandasCriticas.forEach((demanda) => {

        const item = document.createElement("div");
        item.className = "demanda-critica";

        const informacoes = document.createElement("div");

        const titulo = document.createElement("strong");

        titulo.textContent = obterCampo(demanda, [
            "TITULO",
            "titulo"
        ]) ?? "Demanda sem título";

        const detalhes = document.createElement("p");

        const tipo = nomesTipo[obterTipo(demanda)] ?? "Não informado";

        const responsavel = obterCampo(demanda, [
            "NOME_RESPONSAVEL",
            "nomeResponsavel",
            "responsavel"
        ]) ?? "Não definido";

        detalhes.textContent = `${tipo} | Responsável: ${responsavel}`;

        informacoes.append(titulo, detalhes);

        const prazo = document.createElement("div");
        prazo.className = "prazo-demanda";

        const textoPrazo = document.createElement("span");
        textoPrazo.textContent = "Prazo";

        const dataPrazo = document.createElement("strong");

        dataPrazo.textContent = formatarData(
            obterCampo(demanda, [
                "PRAZO_FINAL",
                "prazoFinal",
                "prazo"
            ])
        );

        prazo.append(textoPrazo, dataPrazo);

        item.append(informacoes, prazo);

        lista.appendChild(item);

    });

}


// lista de demandas próximas do prazo
function listarProximasDemandas() {

    const lista = document.getElementById("listaProximasDemandas");

    lista.replaceChildren();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const limite = new Date(hoje);
    limite.setDate(limite.getDate() + 7);

    const proximasDemandas = demandas
        .filter((demanda) => {

            const prazo = obterCampo(demanda, [
                "PRAZO_FINAL",
                "prazoFinal",
                "prazo"
            ]);

            if (!prazo) return false;

            const dataPrazo = new Date(prazo);

            if (Number.isNaN(dataPrazo.getTime())) return false;

            dataPrazo.setHours(0, 0, 0, 0);

            const status = obterStatus(demanda);

            return dataPrazo >= hoje
                && dataPrazo <= limite
                && status !== "CONCLUIDA"
                && status !== "CANCELADA";

        })
        .sort((a, b) => {

            const prazoA = new Date(obterCampo(a, [
                "PRAZO_FINAL",
                "prazoFinal",
                "prazo"
            ]));

            const prazoB = new Date(obterCampo(b, [
                "PRAZO_FINAL",
                "prazoFinal",
                "prazo"
            ]));

            return prazoA - prazoB;

        });

    if (proximasDemandas.length === 0) {

        const mensagem = document.createElement("p");
        mensagem.className = "text-muted";
        mensagem.textContent = "Nenhuma demanda com prazo próximo.";

        lista.appendChild(mensagem);
        return;

    }

    proximasDemandas.forEach((demanda) => {

        const item = document.createElement("div");
        item.className = "proxima-demanda";

        const titulo = document.createElement("span");

        titulo.textContent = obterCampo(demanda, [
            "TITULO",
            "titulo"
        ]) ?? "Demanda sem título";

        const prazo = document.createElement("strong");

        prazo.textContent = formatarData(
            obterCampo(demanda, [
                "PRAZO_FINAL",
                "prazoFinal",
                "prazo"
            ])
        );

        item.append(titulo, prazo);

        lista.appendChild(item);

    });

}



function listarDemandas() {

    const tabela = document.getElementById("tabelaDemandas");

    tabela.replaceChildren();

    if (demandas.length === 0) {

        const linha = document.createElement("tr");
        const coluna = document.createElement("td");

        coluna.colSpan = 8;
        coluna.className = "text-center";
        coluna.textContent = "Nenhuma demanda cadastrada.";

        linha.appendChild(coluna);
        tabela.appendChild(linha);

        return;

    }

    demandas.forEach((demanda) => {

        const linha = document.createElement("tr");

        const titulo = obterCampo(demanda, [
            "TITULO",
            "titulo"
        ]) ?? "—";

        const tipo = obterTipo(demanda);
        const prioridade = obterPrioridade(demanda);
        const status = obterStatus(demanda);

        const projeto = obterCampo(demanda, [
            "NOME_PROJETO",
            "nomeProjeto",
            "PROJETO_ID",
            "projetoId"
        ]) ?? "—";

        const responsavel = obterCampo(demanda, [
            "NOME_RESPONSAVEL",
            "nomeResponsavel",
            "responsavel"
        ]) ?? "—";

        const prazo = obterCampo(demanda, [
            "PRAZO_FINAL",
            "prazoFinal",
            "prazo"
        ]);

        const id = obterCampo(demanda, [
            "ID_DEMANDA",
            "idDemanda",
            "id"
        ]);

        const valores = [
            titulo,
            nomesTipo[tipo] ?? tipo,
            nomesPrioridade[prioridade] ?? prioridade,
            nomesStatus[status] ?? status,
            projeto,
            responsavel,
            formatarData(prazo)
        ];

        valores.forEach((valor) => {

            const coluna = document.createElement("td");
            coluna.textContent = valor || "—";

            linha.appendChild(coluna);

        });

        const colunaAcoes = document.createElement("td");

        if (id !== null) {

            const link = document.createElement("a");

            link.textContent = "Ver";
            link.className = "btn btn-sm btn-outline-primary";


            link.href = `/detalhes/${encodeURIComponent(id)}`;

            colunaAcoes.appendChild(link);

        } else {

            colunaAcoes.textContent = "—";

        }

        linha.appendChild(colunaAcoes);

        tabela.appendChild(linha);

    });

}


// Atualizando todas as informações na tela
function atualizarDashboard() {
    renderizarUsuario()

    atualizarCards();

    atualizarPrioridades();

    atualizarTipos();

    listarDemandasCriticas();

    listarProximasDemandas();

    listarDemandas();


}


// Buscando as demandas na API
async function carregarDemandas() {

    try {

        const usuario = obterUsuarioLogado()

        const resposta = await fetch(`${API_BASE_URL}/api/demandas/usuario/${usuario.id}`, {
            method: "GET",
            credentials: "include"
        });


        if (!resposta.ok) {
            throw new Error("Não foi possível buscar as demandas.");
        }

        const resultado = await resposta.json();


        if (Array.isArray(resultado)) {

            demandas = resultado;

        } else if (Array.isArray(resultado.demandas)) {

            demandas = resultado.demandas;

        } else {

            demandas = [];

        }

        atualizarDashboard();

        const mensagem = document.getElementById("mensagemDashboard");

        if (mensagem) {
            mensagem.remove();
        }

    } catch (erro) {

        console.error("Erro ao carregar demandas:", erro);

        mostrarMensagem(
            erro.message || "Erro ao carregar as demandas do banco de dados."
        );

    }

}


// Inicia o carregamento quando a página abrir
window.addEventListener("DOMContentLoaded", () => {

    carregarDemandas();

    // Atualizando os dados a cada 30 segundos
    setInterval(carregarDemandas, 30000);

});
