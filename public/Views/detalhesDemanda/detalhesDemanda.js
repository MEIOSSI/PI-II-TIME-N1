//Por: Murilo Lopes - 26894964

const nomesStatus = {
    // Associa cada código de status usado pelo banco ao texto exibido na tela.
    "ABERTA": "Aberta",
    // Define o rótulo legível para demandas em execução.
    "EM ANDAMENTO": "Em andamento",
    // Define o rótulo legível para demandas em revisão.
    "EM REVISAO": "Em revisão",
    // Define o rótulo legível para demandas concluídas.
    "CONCLUIDA": "Concluída",
    // Define o rótulo legível para demandas canceladas.
    "CANCELADA": "Cancelada"
};

// Informa qual é o próximo status permitido em cada etapa do fluxo.
const proximoStatus = {
    // Uma demanda aberta pode seguir para andamento.
    "ABERTA": "EM ANDAMENTO",
    // Uma demanda em andamento pode seguir para revisão.
    "EM ANDAMENTO": "EM REVISAO",
    // Uma demanda em revisão pode seguir para conclusão.
    "EM REVISAO": "CONCLUIDA"
};

// Traduz os nomes técnicos dos campos do histórico para rótulos da interface.
const nomesCamposHistorico = {
    // Rótulo apresentado quando o campo alterado é o status.
    STATUS: "Status",
    // Rótulo apresentado quando o campo alterado é o responsável.
    RESPONSAVEL: "Responsável",
    // Rótulo apresentado quando o campo alterado é a prioridade.
    PRIORIDADE: "Prioridade",
    // Rótulo apresentado quando o campo alterado é o prazo.
    PRAZO_FINAL: "Prazo",
    // Rótulo apresentado quando o campo alterado é o título.
    TITULO: "Título",
    // Rótulo apresentado quando o campo alterado é a descrição.
    DESCRICAO: "Descrição",
    // Rótulo apresentado quando o campo alterado é o tipo.
    TIPO: "Tipo"
};

// Traduz os códigos de prioridade para textos com acentuação.
const nomesPrioridade = {
    // Nome exibido para a prioridade crítica.
    CRITICA: "Crítica",
    // Nome exibido para a prioridade alta.
    ALTA: "Alta",
    // Nome exibido para a prioridade média.
    MEDIA: "Média",
    // Nome exibido para a prioridade baixa.
    BAIXA: "Baixa"
};

// Traduz os códigos de tipo de demanda para nomes legíveis.
const nomesTipo = {
    // Rótulo de demanda do tipo tarefa.
    TAREFA: "Tarefa",
    // Rótulo de demanda do tipo defeito.
    DEFEITO: "Defeito",
    // Rótulo de demanda do tipo melhoria.
    MELHORIA: "Melhoria",
    // Rótulo de demanda do tipo documentação.
    DOCUMENTACAO: "Documentação"
};

// Converte uma data para o formato brasileiro e, opcionalmente, inclui o horário.
function formatarData(valor, incluirHora = false) {
    // Mostra um traço quando a data não foi informada.
    if (!valor) return "—";

    // Converte o valor recebido para um objeto de data do JavaScript.
    const data = new Date(valor);
    // Se a conversão falhar, devolve o valor original como texto.
    if (Number.isNaN(data.getTime())) return String(valor);

    // Escolhe as opções de exibição conforme seja necessário incluir o horário.
    const opcoes = incluirHora
        ? { dateStyle: "short", timeStyle: "short" }
        : { dateStyle: "short" };

    // Formata a data no padrão brasileiro e devolve o texto resultante.
    return new Intl.DateTimeFormat("pt-BR", opcoes).format(data);
}

// Exibe uma mensagem de erro na área reservada da tela de detalhes.
function mostrarErroDetalhes(mensagem) {
    // Localiza no HTML o espaço reservado para mensagens de erro.
    const areaMensagem = document.getElementById("mensagemDetalhes");
    // Define o texto que será mostrado ao usuário.
    areaMensagem.textContent = mensagem;
    // Torna a área de mensagem visível.
    areaMensagem.hidden = false;
    // Aplica as classes de alerta vermelho do Bootstrap.
    areaMensagem.className = "container mt-3 alert alert-danger";
}

// Traduz valores do histórico para os nomes apresentados na interface.
function formatarValorHistorico(campo, valor) {
    // Substitui valores vazios por um traço para manter a apresentação clara.
    if (valor === null || valor === undefined || valor === "") return "—";

    // Padroniza o valor para procurar nos mapas sem diferença de caixa ou espaços.
    const valorNormalizado = String(valor).trim().toUpperCase();

    // Traduz o status antigo ou novo para o rótulo correspondente.
    if (campo === "STATUS") return nomesStatus[valorNormalizado] ?? valor;
    // Traduz a prioridade para o nome com acentuação.
    if (campo === "PRIORIDADE") return nomesPrioridade[valorNormalizado] ?? valor;
    // Traduz o tipo de demanda para o nome legível.
    if (campo === "TIPO") return nomesTipo[valorNormalizado] ?? valor;
    // Formata valores de prazo como data brasileira.
    if (campo === "PRAZO_FINAL") return formatarData(valor);

    // Para outros campos, devolve o valor sem tradução.
    return valor;
}

// Limpa e monta a lista de alterações da demanda recebida pela API.
function renderizarHistorico(historico) {
    // Encontra no HTML o contêiner onde as alterações serão listadas.
    const listaHistorico = document.getElementById("listaHistorico");
    // Remove itens anteriores para evitar duplicação ao atualizar a tela.
    listaHistorico.replaceChildren();

    // Trata resposta vazia ou inválida exibindo uma mensagem informativa.
    if (!Array.isArray(historico) || historico.length === 0) {
        // Cria um parágrafo para comunicar que ainda não há alterações.
        const mensagem = document.createElement("p");
        // Aplica estilo discreto do Bootstrap e remove margem inferior.
        mensagem.className = "text-muted mb-0";
        // Define o conteúdo da mensagem sem interpretar HTML.
        mensagem.textContent = "Nenhuma alteração registrada ainda.";
        // Insere a mensagem dentro do contêiner do histórico.
        listaHistorico.appendChild(mensagem);
        // Encerra a função porque não há itens para montar.
        return;
    }

    // Percorre cada alteração recebida e cria seu elemento visual.
    historico.forEach((alteracao) => {
        // Normaliza o nome do campo alterado para facilitar sua tradução.
        const campo = String(alteracao.CAMPO_ALTERADO ?? "").trim().toUpperCase();
        // Cria o contêiner visual de uma alteração do histórico.
        const item = document.createElement("div");
        // Aplica a classe que estiliza cada registro do histórico.
        item.className = "historico";

        // Cria a área superior que contém usuário e data.
        const cabecalho = document.createElement("div");
        // Alinha usuário e data em lados opostos do cabeçalho.
        cabecalho.className = "d-flex justify-content-between";

        // Cria o elemento em negrito para mostrar quem fez a alteração.
        const usuario = document.createElement("strong");
        // Usa o nome recebido ou "Sistema" quando não houver usuário associado.
        usuario.textContent = alteracao.NOME_USUARIO ?? "Sistema";

        // Cria o parágrafo que exibirá a data da alteração.
        const data = document.createElement("p");
        // Aplica o estilo usado para textos pequenos na data.
        data.className = "pequeno";
        // Formata a data incluindo o horário.
        data.textContent = formatarData(alteracao.DATA_ALTERACAO, true);

        // Cria o parágrafo que receberá a descrição da mudança.
        const descricao = document.createElement("p");
        // Obtém o rótulo amigável do campo ou usa o próprio código do campo.
        const nomeCampo = nomesCamposHistorico[campo] ?? campo;
        // Formata o valor anterior de acordo com o tipo de campo.
        const valorAnterior = formatarValorHistorico(campo, alteracao.VALOR_ANTERIOR);
        // Formata o valor novo de acordo com o tipo de campo.
        const valorNovo = formatarValorHistorico(campo, alteracao.VALOR_NOVO);
        // Monta a frase que descreve o valor antigo e o novo.
        descricao.textContent = `${nomeCampo} alterado: ${valorAnterior} → ${valorNovo}`;

        // Insere usuário e data no cabeçalho.
        cabecalho.append(usuario, data);
        // Insere o cabeçalho e a descrição no registro de histórico.
        item.append(cabecalho, descricao);
        // Adiciona o registro pronto à lista exibida na página.
        listaHistorico.appendChild(item);
    });
}

// Busca os dados da demanda pela ID da URL e preenche os componentes da página.
async function carregarDetalhesDemanda() {
    // Lê o parâmetro "id" da URL da página, por exemplo ?id=12.
    const id = new URLSearchParams(window.location.search).get("id");

    // Confere se o ID existe, contém apenas números e é maior que zero.
    if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
        // Informa que o endereço não contém um ID de demanda válido.
        mostrarErroDetalhes("ID da demanda ausente ou inválido na URL.");
        // Interrompe o carregamento porque não é possível consultar sem ID.
        return;
    }

    // Inicia o bloco de operações que podem falhar durante a consulta.
    try {
        // Solicita à API os dados da demanda identificada pelo ID.
        const resultado = await detalhesDemandaApi(id);
        // Aceita tanto uma lista de resultados quanto um único objeto.
        const demanda = Array.isArray(resultado) ? resultado[0] : resultado;

        // Verifica se a API encontrou uma demanda.
        if (!demanda) {
            // Mostra uma mensagem caso o ID não corresponda a uma demanda.
            mostrarErroDetalhes("Demanda não encontrada.");
            // Encerra a função porque não há dados para apresentar.
            return;
        }

        // Normaliza o status atual para comparar com os códigos conhecidos.
        const statusAtual = String(demanda.STATUS ?? "").trim().toUpperCase();
        // Obtém o nome do usuário logado ou informa que não há autenticação.
        const nomeUsuarioLogado = demanda.NOME_USUARIO_LOGADO ?? "Usuário não autenticado";
        // Normaliza o papel do usuário dentro do projeto.
        const papelUsuarioProjeto = String(demanda.PAPEL_USUARIO_PROJETO ?? "").trim().toUpperCase();
        // Converte o código do papel para o texto mostrado na interface.
        const nomePapel = papelUsuarioProjeto === "LIDER"
            ? "Líder"
            : papelUsuarioProjeto === "MEMBRO"
                ? "Membro"
                : "Sem vínculo";

        // Localiza o botão que avança a demanda no ciclo de vida.
        const botaoStatus = document.getElementById("btnMoverStatus");
        // Procura o próximo status permitido para o status atual.
        const destino = proximoStatus[statusAtual];
        // Marca se a conclusão requer papel de líder no projeto.
        const precisaDeLider = statusAtual === "EM REVISAO" && destino === "CONCLUIDA";
        // Permite avançar quando há próximo status e, se exigido, o usuário é líder.
        const podeAvancar = Boolean(destino) && (!precisaDeLider || papelUsuarioProjeto === "LIDER");

        // Desativa o botão quando a mudança não está disponível ao usuário.
        botaoStatus.disabled = !podeAvancar;
        // Define o texto do botão conforme o próximo passo ou a permissão.
        botaoStatus.textContent = !destino
            ? "Demanda finalizada"
            : podeAvancar
                ? `Mover para ${nomesStatus[destino]}`
                : "Somente o líder pode concluir";

        // Configura a ação do botão quando a mudança de status está permitida.
        if (podeAvancar) {
            // Ao clicar, solicita a mudança de status e recarrega os dados atualizados.
            botaoStatus.onclick = async () => {
                // Trata possíveis erros ocorridos durante a atualização.
                try {
                    // Desativa o botão para impedir cliques repetidos durante a requisição.
                    botaoStatus.disabled = true;
                    // Envia à API a solicitação para mudar para o próximo status.
                    await alterarStatusDemandaApi(id, destino);
                    // Consulta novamente a demanda para atualizar os dados na tela.
                    await carregarDetalhesDemanda();
                // Captura erros da requisição e informa o usuário.
                } catch (error) {
                    // Mostra a mensagem retornada pela API ou pelo navegador.
                    mostrarErroDetalhes(error.message);
                    // Reativa o botão para permitir uma nova tentativa.
                    botaoStatus.disabled = false;
                }
            };
        // Se a mudança não for permitida, remove qualquer ação do botão.
        } else {
            botaoStatus.onclick = null;
        }

        // Preenche o título da demanda ou usa um texto padrão.
        document.getElementById("tituloDemanda").textContent = demanda.TITULO ?? "Demanda";
        // Mostra o tipo da demanda ou um traço quando estiver vazio.
        document.getElementById("tipoDemanda").textContent = demanda.TIPO ?? "—";
        // Mostra a prioridade da demanda ou um traço quando estiver vazia.
        document.getElementById("prioridadeDemanda").textContent = demanda.PRIORIDADE ?? "—";
        // Mostra o nome amigável do status ou o valor original como alternativa.
        document.getElementById("statusDemanda").textContent = nomesStatus[statusAtual] ?? demanda.STATUS ?? "—";
        // Mostra o nome do projeto associado à demanda.
        document.getElementById("projeto").textContent = demanda.NOME_PROJETO ?? "—";
        // Mostra o responsável ou informa que ainda não há um.
        document.getElementById("responsavelDemanda").textContent = demanda.NOME_RESPONSAVEL ?? "Sem responsável";
        // Formata e mostra o prazo final da demanda.
        document.getElementById("dataFinalDemanda").textContent = formatarData(demanda.PRAZO_FINAL);
        // Formata e mostra a data de criação junto com o horário.
        document.getElementById("criacaoDemanda").textContent = formatarData(demanda.DATA_CRIACAO, true);
        // Formata e mostra a data da última atualização junto com o horário.
        document.getElementById("ultimaAtualizacaoDemanda").textContent = formatarData(demanda.DATA_ATUALIZACAO, true);
        // Mostra o código da demanda ou usa o ID extraído da URL.
        document.getElementById("idDemanda").textContent = demanda.ID_DEMANDA ?? id;
        // Mostra a descrição da demanda ou um traço quando não houver texto.
        document.getElementById("descricaoDemanda").textContent = demanda.DESCRICAO ?? "—";
        // Mostra o nome do usuário autenticado na área de comentários.
        document.getElementById("usuarioLogado").textContent = nomeUsuarioLogado;
        // Mostra o usuário e seu papel dentro do projeto.
        document.getElementById("usuarioProjeto").textContent = `${nomeUsuarioLogado} (${nomePapel})`;

        // Percorre cada etapa visual do ciclo de vida.
        document.querySelectorAll("[data-status]").forEach((etapa) => {
            // Destaca somente a etapa cujo status corresponde ao status atual.
            etapa.classList.toggle("ativo", etapa.dataset.status === statusAtual);
        });

        // Busca o histórico separadamente para que falha nele não esconda os detalhes.
        try {
            // Solicita à API todas as alterações registradas para esta demanda.
            const historico = await historicoDemandaApi(id);
            // Desenha o histórico recebido na página.
            renderizarHistorico(historico);
        // Trata falha na consulta ao histórico sem interromper os detalhes da demanda.
        } catch (error) {
            // Mostra a mensagem de lista vazia se não foi possível carregar o histórico.
            renderizarHistorico([]);
            // Registra o erro no console para facilitar a investigação durante desenvolvimento.
            console.error("Erro ao carregar o histórico da demanda:", error);
        }
    // Trata erros da consulta principal ou do preenchimento da tela.
    } catch (error) {
        // Registra o erro completo no console.
        console.error("Erro ao carregar os detalhes da demanda:", error);
        // Exibe a mensagem do erro ou um texto padrão para o usuário.
        mostrarErroDetalhes(error.message || "Não foi possível carregar a demanda.");
    }
}

// Carrega os detalhes assim que o HTML da página estiver pronto.
window.addEventListener("DOMContentLoaded", carregarDetalhesDemanda);
