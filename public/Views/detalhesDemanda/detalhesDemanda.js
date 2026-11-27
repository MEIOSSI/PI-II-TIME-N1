    //Por: Murilo Lopes - 26894964

    const socket = io(); // -> "liga" o socket para fazer a comunicação

    // Cria na tela um comentário vindo do histórico ou do Socket.IO.
    function renderizarComentario(comentario) {
        const idNaUrl = window.location.pathname.split("/").filter(Boolean).pop();

        // Ignora payloads inválidos ou comentários de outra demanda.
        if (!comentario || String(comentario.idDemanda) !== idNaUrl) return;
        if (typeof comentario.texto !== "string" || !comentario.texto.trim()) return;

        const lista = document.getElementById("listaComentarios");
        if (!lista) return;
        document.getElementById("mensagemSemComentarios")?.remove();

        const item = document.createElement("div");
        item.className = "comentario mb-3";

        const cabecalho = document.createElement("div");
        cabecalho.className = "d-flex justify-content-between";

        const autor = document.createElement("strong");
        autor.textContent = comentario.nomeUsuario ?? `Usuário #${comentario.usuarioId}`;

        const data = document.createElement("p");
        data.className = "pequeno";
        data.textContent = formatarData(comentario.dataCriacao ?? new Date(), true);

        const texto = document.createElement("p");
        texto.textContent = comentario.texto;

        cabecalho.append(autor, data);
        item.append(cabecalho, texto);
        lista.appendChild(item);
    }

    // Exibe comentários novos enviados pelo servidor em tempo real.
    socket.on("comentario-criado", (comentario) => {
        renderizarComentario(comentario);
    });

    // Status e rótulos usados na tela.
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

    // Formata datas para o padrão brasileiro.
    function formatarData(valor, incluirHora = false) {
        if (!valor) return "—";

        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return String(valor);

        const opcoes = incluirHora
            ? { dateStyle: "short", timeStyle: "short" }
            : { dateStyle: "short" };

        return new Intl.DateTimeFormat("pt-BR", opcoes).format(data);
    }

    // Exibe mensagens de erro na página.
    function mostrarErroDetalhes(mensagem) {
        const areaMensagem = document.getElementById("mensagemDetalhes");
        areaMensagem.textContent = mensagem;
        areaMensagem.hidden = false;
        areaMensagem.className = "container mt-3 alert alert-danger";
    }

    // Traduz valores exibidos no histórico.
    function formatarValorHistorico(campo, valor) {
        if (valor === null || valor === undefined || valor === "") return "—";

        const valorNormalizado = String(valor).trim().toUpperCase();

        if (campo === "STATUS") return nomesStatus[valorNormalizado] ?? valor;
        if (campo === "PRIORIDADE") return nomesPrioridade[valorNormalizado] ?? valor;
        if (campo === "TIPO") return nomesTipo[valorNormalizado] ?? valor;
        if (campo === "PRAZO_FINAL") return formatarData(valor);

        return valor;
    }

    // Renderiza o histórico da demanda.
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

    // Carrega os dados e configura as ações da tela.
    async function carregarDetalhesDemanda() {
        const id = window.location.pathname.split("/").filter(Boolean).pop();

        if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
            mostrarErroDetalhes("ID da demanda ausente ou inválido na URL.");
            return;
        }

        try {
            await new Promise((resolve, reject) => {
                socket.timeout(10000).emit("entrar-demanda", id, (erro, resposta) => {
                    if (erro) {
                        reject(new Error("O servidor não confirmou a entrada na demanda."));
                    } else if (!resposta?.ok) {
                        reject(new Error(resposta?.erro || "Não foi possível acessar esta demanda."));
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            mostrarErroDetalhes(error.message);
            return;
        }

        try {
            const resultado = await detalhesDemandaApi(id);
            const demanda = Array.isArray(resultado) ? resultado[0] : resultado;

            if (!demanda) {
                mostrarErroDetalhes("Demanda não encontrada.");
                return;
            }

            document.getElementById("linkVoltarDemandas").href =
                `/Views/telaDemandas/demandas.html?id=${encodeURIComponent(demanda.PROJETO_ID)}`;

            const statusAtual = String(demanda.STATUS ?? "").trim().toUpperCase();
            const nomeUsuarioLogado = demanda.NOME_USUARIO_LOGADO ?? "Usuário não autenticado";
            const usuarioIdLogado = Number(demanda.ID_USUARIO_LOGADO);
            const ehResponsavel = Number(demanda.RESPONSAVEL_ID) === usuarioIdLogado;
            const ehAdministrador = String(demanda.PERFIL_USUARIO_LOGADO ?? "").trim().toUpperCase() === "ADMINISTRADOR";
            const papelUsuarioProjeto = String(demanda.PAPEL_USUARIO_PROJETO ?? "").trim().toUpperCase();
            const botaoEditar = document.getElementById("btnEditarDemanda");
            const podeEditar = ehAdministrador || papelUsuarioProjeto === "LIDER";
            botaoEditar.hidden = !podeEditar;
            botaoEditar.onclick = podeEditar
                ? () => { window.location.href = `/Views/cadastroDemanda/index.html?id=${encodeURIComponent(id)}`; }
                : null;
            const nomePapel = ehAdministrador
                ? "Administrador"
                : papelUsuarioProjeto === "LIDER"
                    ? "Líder"
                    : papelUsuarioProjeto === "MEMBRO_DA_EQUIPE"
                        ? "Membro"
                        : "Sem vínculo";

            const botaoStatus = document.getElementById("btnMoverStatus");
            const destino = proximoStatus[statusAtual];
            botaoStatus.hidden = !destino;
            const precisaDeLider = statusAtual === "EM REVISAO" && destino === "CONCLUIDA";
            const precisaDoResponsavel = statusAtual === "ABERTA" || statusAtual === "EM ANDAMENTO";
            const podeAvancar = Boolean(destino)
                && (!precisaDoResponsavel || ehResponsavel || papelUsuarioProjeto === "LIDER" || ehAdministrador)
                && (!precisaDeLider || papelUsuarioProjeto === "LIDER" || ehAdministrador);

            botaoStatus.disabled = !podeAvancar;
            botaoStatus.textContent = !destino
                ? "Demanda finalizada"
                : podeAvancar
                    ? `Mover para ${nomesStatus[destino]}`
                    : precisaDeLider
                        ? "Somente o líder ou administrador pode concluir"
                        : "Somente responsável, líder ou administrador pode avançar";

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

            const botaoVoltarRevisao = document.getElementById("btnVoltarRevisao");
            const podeVoltarRevisao = statusAtual === "EM REVISAO"
                && (papelUsuarioProjeto === "LIDER" || ehAdministrador);

            botaoVoltarRevisao.hidden = !podeVoltarRevisao;
            botaoVoltarRevisao.onclick = async () => {
                botaoVoltarRevisao.disabled = true;

                try {
                    await alterarStatusDemandaApi(id, "EM ANDAMENTO");
                    await carregarDetalhesDemanda();
                } catch (error) {
                    mostrarErroDetalhes(error.message);
                    botaoVoltarRevisao.disabled = false;
                }
            };

            const botaoCancelar = document.getElementById("btnCancelarDemanda");
            const podeCancelar = (papelUsuarioProjeto === "LIDER" || ehAdministrador)
                && statusAtual !== "CONCLUIDA"
                && statusAtual !== "CANCELADA";

            botaoCancelar.hidden = !podeCancelar;
            botaoCancelar.onclick = async () => {
                if (!confirm("Tem certeza que deseja cancelar esta demanda?")) return;

                botaoCancelar.disabled = true;

                try {
                    await alterarStatusDemandaApi(id, "CANCELADA");
                    await carregarDetalhesDemanda();
                } catch (error) {
                    mostrarErroDetalhes(error.message);
                    botaoCancelar.disabled = false;
                }
            };

            const botaoReabrir = document.getElementById("btnReabrirDemanda");
            const podeReabrir = (papelUsuarioProjeto === "LIDER" || ehAdministrador)
                && (statusAtual === "CONCLUIDA" || statusAtual === "CANCELADA");

            botaoReabrir.hidden = !podeReabrir;
            botaoReabrir.onclick = async () => {
                if (!confirm("Deseja reabrir esta demanda? Ela voltará para Aberta.")) return;

                botaoReabrir.disabled = true;

                try {
                    await alterarStatusDemandaApi(id, "ABERTA");
                    await carregarDetalhesDemanda();
                } catch (error) {
                    mostrarErroDetalhes(error.message);
                    botaoReabrir.disabled = false;
                }
            };

            document.getElementById("tituloDemanda").textContent = demanda.TITULO ?? "Demanda";
            document.getElementById("tipoDemanda").textContent = demanda.TIPO ?? "—";
            document.getElementById("prioridadeDemanda").textContent = demanda.PRIORIDADE ?? "—";
            document.getElementById("statusDemanda").textContent = nomesStatus[statusAtual] ?? demanda.STATUS ?? "—";
            document.getElementById("projeto").textContent = demanda.NOME_PROJETO ?? "—";
            document.getElementById("responsavelDemanda").textContent = demanda.NOME_RESPONSAVEL ?? "Sem responsável";
            document.getElementById("dataFinalDemanda").textContent = formatarData(demanda.PRAZO_FINAL);
            document.getElementById("criacaoDemanda").textContent = formatarData(demanda.DATA_CRIACAO_UTC ?? demanda.DATA_CRIACAO, true);
            document.getElementById("ultimaAtualizacaoDemanda").textContent = formatarData(demanda.DATA_ATUALIZACAO_UTC ?? demanda.DATA_ATUALIZACAO, true);
            document.getElementById("idDemanda").textContent = demanda.ID_DEMANDA ?? id;
            document.getElementById("descricaoDemanda").textContent = demanda.DESCRICAO ?? "—";
            document.getElementById("usuarioLogado").textContent = nomeUsuarioLogado;
            document.getElementById("usuarioProjeto").textContent = `${nomeUsuarioLogado} - ${nomePapel}`;

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

            try {
                const comentarios = await comentariosDemandaApi(id);
                const listaComentarios = document.getElementById("listaComentarios");
                listaComentarios.replaceChildren();

                if (comentarios.length === 0) {
                    const mensagem = document.createElement("p");
                    mensagem.id = "mensagemSemComentarios";
                    mensagem.className = "text-muted mb-3";
                    mensagem.textContent = "Nenhum comentário ainda.";
                    listaComentarios.appendChild(mensagem);
                } else {
                    comentarios.forEach((comentario) => {
                        renderizarComentario({
                            idDemanda: comentario.DEMANDA_ID,
                            usuarioId: comentario.USUARIO_ID,
                            nomeUsuario: comentario.NOME_USUARIO,
                            texto: comentario.TEXTO,
                            dataCriacao: comentario.DATA_CRIACAO
                        });
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar os comentários:", error);
                mostrarErroDetalhes(error.message || "Não foi possível carregar os comentários.");
            }
        } catch (error) {
            console.error("Erro ao carregar os detalhes da demanda:", error);
            mostrarErroDetalhes(error.message || "Não foi possível carregar a demanda.");
        }

        const botaoPublicar = document.getElementById("btnPublicarComentario");
        const campoComentario = document.getElementById("textoComentario");

        botaoPublicar.onclick = () => {
            const textoComentario = campoComentario.value.trim();

            if (!textoComentario) return;

            botaoPublicar.disabled = true;

            socket.timeout(10000).emit("novo-comentario", {
                idDemanda: id,
                texto: textoComentario
            }, (erro, resposta) => {
                botaoPublicar.disabled = false;

                if (erro) {
                    mostrarErroDetalhes("O servidor não confirmou o envio. Verifique a conexão e tente novamente.");
                    return;
                }

                if (!resposta?.ok) {
                    mostrarErroDetalhes(resposta?.erro || "Não foi possível publicar o comentário.");
                    return;
                }

                // Só apaga o texto se o comentário foi salvo e o campo não foi alterado depois do clique.
                if (campoComentario.value.trim() === textoComentario) {
                    campoComentario.value = "";
                }
            });
        };
        
    }

    // Inicia o carregamento ao abrir a página.
    window.addEventListener("DOMContentLoaded", carregarDetalhesDemanda);
