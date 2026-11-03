const nomesStatus = {
    "ABERTA": "Aberta",
    "EM ANDAMENTO": "Em andamento",
    "EM REVISAO": "Em revisão",
    "CONCLUIDA": "Concluída",
    "CANCELADA": "Cancelada"
};

const proximoStatus = {
    "ABERTA": "EM ANDAMENTO",
    "EM ANDAMENTO": "EM REVISAO",
    "EM REVISAO": "CONCLUIDA"
};

const nomesCamposHistorico = {
    STATUS: "Status",
    RESPONSAVEL: "Responsável",
    PRIORIDADE: "Prioridade",
    PRAZO_FINAL: "Prazo",
    TITULO: "Título",
    DESCRICAO: "Descrição",
    TIPO: "Tipo"
};

const nomesPrioridade = {
    CRITICA: "Crítica",
    ALTA: "Alta",
    MEDIA: "Média",
    BAIXA: "Baixa"
};

const nomesTipo = {
    TAREFA: "Tarefa",
    DEFEITO: "Defeito",
    MELHORIA: "Melhoria",
    DOCUMENTACAO: "Documentação"
};

function formatarData(valor, incluirHora = false) {
    if (!valor) return "—";

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return String(valor);

    const opcoes = incluirHora
        ? { dateStyle: "short", timeStyle: "short" }
        : { dateStyle: "short" };

    return new Intl.DateTimeFormat("pt-BR", opcoes).format(data);
}

function mostrarErroDetalhes(mensagem) {
    const areaMensagem = document.getElementById("mensagemDetalhes");
    areaMensagem.textContent = mensagem;
    areaMensagem.hidden = false;
    areaMensagem.className = "container mt-3 alert alert-danger";
}

function formatarValorHistorico(campo, valor) {
    if (valor === null || valor === undefined || valor === "") return "—";

    const valorNormalizado = String(valor).trim().toUpperCase();

    if (campo === "STATUS") return nomesStatus[valorNormalizado] ?? valor;
    if (campo === "PRIORIDADE") return nomesPrioridade[valorNormalizado] ?? valor;
    if (campo === "TIPO") return nomesTipo[valorNormalizado] ?? valor;
    if (campo === "PRAZO_FINAL") return formatarData(valor);

    return valor;
}

function renderizarHistorico(historico) {
    const listaHistorico = document.getElementById("listaHistorico");
    listaHistorico.replaceChildren();

    if (!Array.isArray(historico) || historico.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.className = "text-muted mb-0";
        mensagem.textContent = "Nenhuma alteração registrada ainda.";
        listaHistorico.appendChild(mensagem);
        return;
    }

    historico.forEach((alteracao) => {
        const campo = String(alteracao.CAMPO_ALTERADO ?? "").trim().toUpperCase();
        const item = document.createElement("div");
        item.className = "historico";

        const cabecalho = document.createElement("div");
        cabecalho.className = "d-flex justify-content-between";

        const usuario = document.createElement("strong");
        usuario.textContent = alteracao.NOME_USUARIO ?? "Sistema";

        const data = document.createElement("p");
        data.className = "pequeno";
        data.textContent = formatarData(alteracao.DATA_ALTERACAO, true);

        const descricao = document.createElement("p");
        const nomeCampo = nomesCamposHistorico[campo] ?? campo;
        const valorAnterior = formatarValorHistorico(campo, alteracao.VALOR_ANTERIOR);
        const valorNovo = formatarValorHistorico(campo, alteracao.VALOR_NOVO);
        descricao.textContent = `${nomeCampo} alterado: ${valorAnterior} → ${valorNovo}`;

        cabecalho.append(usuario, data);
        item.append(cabecalho, descricao);
        listaHistorico.appendChild(item);
    });
}

async function carregarDetalhesDemanda() {
    const id = new URLSearchParams(window.location.search).get("id");

    if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
        mostrarErroDetalhes("ID da demanda ausente ou inválido na URL.");
        return;
    }

    try {
        const resultado = await detalhesDemandaApi(id);
        const demanda = Array.isArray(resultado) ? resultado[0] : resultado;

        if (!demanda) {
            mostrarErroDetalhes("Demanda não encontrada.");
            return;
        }

        const statusAtual = String(demanda.STATUS ?? "").trim().toUpperCase();
        const nomeUsuarioLogado = demanda.NOME_USUARIO_LOGADO ?? "Usuário não autenticado";
        const papelUsuarioProjeto = String(demanda.PAPEL_USUARIO_PROJETO ?? "").trim().toUpperCase();
        const nomePapel = papelUsuarioProjeto === "LIDER"
            ? "Líder"
            : papelUsuarioProjeto === "MEMBRO"
                ? "Membro"
                : "Sem vínculo";

        const botaoStatus = document.getElementById("btnMoverStatus");
        const destino = proximoStatus[statusAtual];
        const precisaDeLider = statusAtual === "EM REVISAO" && destino === "CONCLUIDA";
        const podeAvancar = Boolean(destino) && (!precisaDeLider || papelUsuarioProjeto === "LIDER");

        botaoStatus.disabled = !podeAvancar;
        botaoStatus.textContent = !destino
            ? "Demanda finalizada"
            : podeAvancar
                ? `Mover para ${nomesStatus[destino]}`
                : "Somente o líder pode concluir";

        if (podeAvancar) {
            botaoStatus.onclick = async () => {
                try {
                    botaoStatus.disabled = true;
                    await alterarStatusDemandaApi(id, destino);
                    await carregarDetalhesDemanda();
                } catch (error) {
                    mostrarErroDetalhes(error.message);
                    botaoStatus.disabled = false;
                }
            };
        } else {
            botaoStatus.onclick = null;
        }

        document.getElementById("tituloDemanda").textContent = demanda.TITULO ?? "Demanda";
        document.getElementById("tipoDemanda").textContent = demanda.TIPO ?? "—";
        document.getElementById("prioridadeDemanda").textContent = demanda.PRIORIDADE ?? "—";
        document.getElementById("statusDemanda").textContent = nomesStatus[statusAtual] ?? demanda.STATUS ?? "—";
        document.getElementById("projeto").textContent = demanda.NOME_PROJETO ?? "—";
        document.getElementById("responsavelDemanda").textContent = demanda.NOME_RESPONSAVEL ?? "Sem responsável";
        document.getElementById("dataFinalDemanda").textContent = formatarData(demanda.PRAZO_FINAL);
        document.getElementById("criacaoDemanda").textContent = formatarData(demanda.DATA_CRIACAO, true);
        document.getElementById("ultimaAtualizacaoDemanda").textContent = formatarData(demanda.DATA_ATUALIZACAO, true);
        document.getElementById("idDemanda").textContent = demanda.ID_DEMANDA ?? id;
        document.getElementById("descricaoDemanda").textContent = demanda.DESCRICAO ?? "—";
        document.getElementById("usuarioLogado").textContent = nomeUsuarioLogado;
        document.getElementById("usuarioProjeto").textContent = `${nomeUsuarioLogado} (${nomePapel})`;

        document.querySelectorAll("[data-status]").forEach((etapa) => {
            etapa.classList.toggle("ativo", etapa.dataset.status === statusAtual);
        });

        try {
            const historico = await historicoDemandaApi(id);
            renderizarHistorico(historico);
        } catch (error) {
            renderizarHistorico([]);
            console.error("Erro ao carregar o histórico da demanda:", error);
        }
    } catch (error) {
        console.error("Erro ao carregar os detalhes da demanda:", error);
        mostrarErroDetalhes(error.message || "Não foi possível carregar a demanda.");
    }
}

window.addEventListener("DOMContentLoaded", carregarDetalhesDemanda);
