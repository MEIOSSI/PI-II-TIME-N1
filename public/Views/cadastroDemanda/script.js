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

    // Validar Responsável -obrigatório e com pelo menos 3 letras-
    if (responsavel === "" && responsavel.length < 3) {
        mostrarErro(campoResponsavel, erroResponsavel, "Responsável é obrigatório");
        formValido = false;
    } else if (responsavel.length < 3) {
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

        if (dataPrazo < hoje) {
            mostrarErro(campoPrazo, erroPrazo, "O prazo não pode ser uma data passada!");
            formValido = false;
        }
    }

    // Validar status -já começa em aberta-
    if (status === "") {
        mostrarErro(campoStatus, erroStatus, "Selecione o status!");
        formValido = false;
    }

    // Se der erro, esconde o painel e para
    if (!formValido) {
        painelResultado.classList.add("d-none");
        return;
    }

    // Se der certo, prossegue
    const tipos = { tarefa: "Tarefa", defeito: "Defeito", melhoria: "Melhoria", documentacao: "Documentação" };
    const prioridades = { critica: "Crítica", alta: "Alta", media: "Média", baixa: "Baixa" };

    const demanda = {
        titulo,
        descricao,
        tipo: tipos[tipo],
        prioridade: prioridades[prioridade],
        projetoId: Number(projeto), // o select entrega texto e a API quer número
        prazo
    };

    try {
        await cadastrarDemandaApi(demanda);

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
async function cadastrarDemandaApi(demanda) {
    const resposta = await fetch("/api/demandas", {
        method: "POST",
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