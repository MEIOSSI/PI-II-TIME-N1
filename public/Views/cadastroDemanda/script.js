// Autor: Leticya
// RA: 26896423 
const formulario = document.querySelector("#FormDemandas");

const campoProjeto = document.querySelector("#projeto");
const campoTitulo = document.querySelector("#titulo");
const campoDescricao = document.querySelector("#descricao");
const campoTipo = document.querySelector("#tipo");
const campoPrioridade = document.querySelector("#prioridade");
const campoResponsavel = document.querySelector("#responsavel");
const campoPrazo = document.querySelector("#prazo");
const campoStatus = document.querySelector("#status");

const erroProjeto = document.querySelector("#erroProjeto");
const painelErro = document.querySelector("#painelErro");
const erroTitulo = document.querySelector("#erroTitulo");
const erroDescricao = document.querySelector("#erroDescricao");
const erroTipo = document.querySelector("#erroTipo");
const erroPrioridade = document.querySelector("#erroPrioridade");
const erroResponsavel = document.querySelector("#erroResponsavel");
const erroPrazo = document.querySelector("#erroPrazo");
const erroStatus = document.querySelector("#erroStatus");

// Painel exibido quando a demanda é cadastrada com sucesso
const painelResultado = document.querySelector("#painelResultado");

// se a URL tiver ?id=9 a tela abre em modo edição, senão é um cadastro novo
const idDemanda = new URLSearchParams(window.location.search).get("id");
const modoEdicao = idDemanda !== null;

// traduz o valor do select (tipo/prioridade) pro nome que a API usa
const tipos = { tarefa: "Tarefa", defeito: "Defeito", melhoria: "Melhoria", documentacao: "Documentação" };
const prioridades = { critica: "Crítica", alta: "Alta", media: "Média", baixa: "Baixa" };

const camposComErro = [
    campoProjeto,
    campoTitulo,
    campoDescricao,
    campoTipo,
    campoPrioridade,
    campoResponsavel,
    campoPrazo,
    campoStatus
];

const mensagensDeErro = [
    erroProjeto,
    erroTitulo,
    erroDescricao,
    erroTipo,
    erroPrioridade,
    erroResponsavel,
    erroPrazo,
    erroStatus
];

// Deixa o campo com a borda vermelha e escreve a mensagem embaixo dele
function mostrarErro(campo, elementoErro, mensagem) {
    campo.classList.add("is-invalid");
    elementoErro.innerText = mensagem;
}

// Tira todos os erros da tela -antes de validar novamente- se não erros da tentativa anterior ficam aparecendo
function limparErros() {
    camposComErro.forEach(function (campo) {
        campo.classList.remove("is-invalid");
    });

    mensagensDeErro.forEach(function (elementoErro) {
    elementoErro.innerText = "";
    });
}

// Quando clica em CADASTRAR

formulario.addEventListener("submit", async function (event) {
    // p/ quando a página recarregar não perder tudo
    event.preventDefault();
    limparErros();

    // o trim() tira os espaços, quem digita só espações não passa como preenchido
    const projeto = campoProjeto.value;
    const titulo = campoTitulo.value.trim();
    const descricao = campoDescricao.value.trim();
    const tipo = campoTipo.value;
    const prioridade = campoPrioridade.value.trim();
    const responsavel = campoResponsavel.value.trim();
    const prazo = campoPrazo.value;
    const status = campoStatus.value;

    // começa true e vira false se algum campo estiver errado
    let formValido = true;

    // Validar projeto -toda demanda precisa estar ligada a um projeto-
    if (projeto === "") {
        mostrarErro(campoProjeto, erroProjeto, "Toda demanda precisa de um projeto!");
        formValido = false;
    }
    
    // Validar título (precisa estar preenchido e ter pelo menos 3 letras)
    if (titulo === "") {
        mostrarErro(campoTitulo, erroTitulo, "Título é obrigatório!");
        formValido = false;
    } else if (titulo.length < 3) {
        mostrarErro(campoTitulo, erroTitulo, "O título deve possuir pelo menos 3 caracteres");
        formValido = false;
    }

    // Validar descrição -precisa de pelo menos 10 caracteres
    if (descricao === "") {
        mostrarErro(campoDescricao, erroDescricao, "Descrição é obrigatória!");
        formValido = false;
    } else if (descricao.length < 10) {
        mostrarErro(campoDescricao, erroDescricao, "A descrição deve possuir pelo menos 10 caracteres");
        formValido = false;
    }

    // Validar tipo
    if (tipo === "") {
        mostrarErro(campoTipo, erroTipo, "Selecione o tipo de demanda!");
        formValido = false;
    }

    // Validar prioridade
    if (prioridade === "") {
        mostrarErro(campoPrioridade, erroPrioridade, "Selecione a prioridade!");
        formValido = false;
    }

    // Responsável é opcional na criação, mas se preencher precisa ter 3+ letras
    if (responsavel !== "" && responsavel.length < 3) {
        mostrarErro(campoResponsavel, erroResponsavel, "O responsável deve possuir pelo menos 3 letras");
        formValido = false;
    }

    // Validar prazo (precisa ser hoje ou data futura)
    if (prazo === "") {
        mostrarErro(campoPrazo, erroPrazo, "Prazo é obrigatório!");
        formValido = false;
    } else {
        // Zera a hora para contar só o dia
        const hoje = new Date();
        hoje.setHours(0,0,0,0);

        //O T00:00:00 evita erro de fuso horário
        const dataPrazo = new Date(`${prazo}T00:00:00`);

        if (!modoEdicao && dataPrazo < hoje) { 
            mostrarErro(campoPrazo, erroPrazo, "O prazo não pode ser uma data passada!");
            formValido = false;
        }
    }

    // Validar status -já começa em aberta-
    if (!modoEdicao && status === "") {
        mostrarErro(campoStatus, erroStatus, "Selecione o status!");
        formValido = false;
    }

    // Se der erro, esconde o painel e para
    if (!formValido) {
        painelResultado.classList.add("d-none");
        return;
    }

    const demanda = {
        titulo,
        descricao,
        tipo: tipos[tipo],
        prioridade: prioridades[prioridade],
        projetoId: Number(projeto), // o select entrega texto e a API quer número
        prazo
    };

try {
    await enviarDemandaApi(demanda);

    // editou: volta pra tela de detalhes da demanda
    if (modoEdicao) {
        window.location.href = `/detalhes/${idDemanda}`;
     return;
    }

        // deu certo
        painelErro.classList.add("d-none");
        painelResultado.classList.remove("d-none");
    } catch (erro) {
        // erro.message traz a mensagem da API, ou um aviso se o servidor estiver desligado
        painelErro.innerText = erro.message;
        painelErro.classList.remove("d-none");
        painelResultado.classList.add("d-none");
    } 
});

// Reset limpa os campos, mas não os erros nem o painel
formulario.addEventListener("reset", function () {
    limparErros();
    painelResultado.classList.add("d-none");
});

// manda a demanda p/ a API -igual o cadastrarAlunoApi da aula-
async function enviarDemandaApi(demanda) {
    const url = modoEdicao ? `/api/demandas/${idDemanda}` : "/api/demandas";

    const resposta = await fetch(url, {
        method: modoEdicao ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demanda)
    });

    const dados = await resposta.json();

    // se a API recusou -400- joga o erro com a mensagem dela
    if (!resposta.ok) {
        throw new Error(dados.mensagem);
    }

    return dados;
}

// tira acento e maiúsculas pra comparar textos (ex.: "Em revisão" e "em revisao")
function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// modo edição: busca a demanda na API e preenche o formulário
async function carregarDemanda() {
    try {
        const resposta = await fetch(`/api/demandas/${idDemanda}`);
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem);
        }

        // o select só tem o projeto 1 fixo, então cria a opção se a demanda for de outro projeto
        if (!campoProjeto.querySelector(`option[value="${dados.projetoId}"]`)) {
            campoProjeto.add(new Option(`Projeto ${dados.projetoId}`, dados.projetoId));
        }

        campoProjeto.value = dados.projetoId;
        campoTitulo.value = dados.titulo;
        campoDescricao.value = dados.descricao;
        campoTipo.value = Object.keys(tipos).find((chave) => tipos[chave] === dados.tipo);
        campoPrioridade.value = Object.keys(prioridades).find((chave) => prioridades[chave] === dados.prioridade);
        campoPrazo.value = dados.prazo || "";

        // o status vem como "Em andamento": acha a opção do select com o mesmo texto
        for (const opcao of campoStatus.options) {
            if (normalizar(opcao.text) === normalizar(dados.status)) {
                campoStatus.value = opcao.value;
            }
        }

        // status e responsável não se alteram por essa tela
        campoStatus.disabled = true;
        campoResponsavel.disabled = true;
    } catch (erro) {
        painelErro.innerText = erro.message;
        painelErro.classList.remove("d-none");
    }
}

// busca os projetos na API da Valentina (GET /projetos) e preenche o select
async function carregarProjetos() {
    try {
        const resposta = await fetch("/projetos");
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(dados.mensagem || dados.erro || "Não foi possível carregar os projetos.");
        }

        campoProjeto.innerHTML = '<option value="">Selecione o projeto...</option>';

        (dados.projetos || []).forEach((projeto) => {
            campoProjeto.add(new Option(projeto.TITULO, projeto.ID_PROJETO));
        });
    } catch (erro) {
        painelErro.innerText = erro.message;
        painelErro.classList.remove("d-none");
    }
}

// primeiro carrega os projetos, depois preenche a edição (senão o select ainda estaria vazio)
async function iniciar() {
    await carregarProjetos();

    if (modoEdicao) {
        document.querySelector("h1").innerText = "Editar demanda";
        document.querySelector("button[type='submit']").innerText = "Salvar";
        await carregarDemanda();
    }
}

iniciar();