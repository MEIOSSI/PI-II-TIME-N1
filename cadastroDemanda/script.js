const formulario = document.querySelector("#FormDemandas");

const campoTitulo = document.querySelector("#titulo");
const campoDescricao = document.querySelector("#descricao");
const campoTipo = document.querySelector("#tipo");
const campoPrioridade = document.querySelector("#prioridade");
const campoResponsavel = document.querySelector("#responsavel");
const campoPrazo = document.querySelector("#prazo");
const campoStatus = document.querySelector("#status");

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
    campoTitulo,
    campoDescricao,
    campoTipo,
    campoPrioridade,
    campoResponsavel,
    campoPrazo,
    campoStatus
];

const mensagensDeErro = [
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