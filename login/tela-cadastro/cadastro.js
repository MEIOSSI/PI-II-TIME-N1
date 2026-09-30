const form = document.querySelector('form')
const campoNome = document.querySelector('#nomecompleto')
const campoCPF = document.querySelector('#cpf')
const campoTel = document.querySelector('#telefone')
const campoEnd = document.querySelector('#endereco')
const campoCEP = document.querySelector('#cep')
const campoEmail = document.querySelector('#email')
const campoSenha = document.querySelector('#senha')
const campoConfirmasenha = document.querySelector('#confirmasenha')

const erroNome = document.querySelector('#erronomecompleto')
const erroCPF = document.querySelector('#errocpf')
const erroTel = document.querySelector('#errotelefone')
const erroEnd = document.querySelector('#erroendereco')
const erroCEP = document.querySelector('#errocep')
const erroEmail = document.querySelector('#erroemail')
const erroSenha = document.querySelector('#errosenha')
const erroConfirmasenha = document.querySelector('#erroconfirmasenha')

const botaoToggleSenha1 = document.querySelector("#togglesenha1");
const iconeToggleSenha1 = botaoToggleSenha1.querySelector("i");

botaoToggleSenha1.addEventListener("click", () => {
    const mostrarSenha = campoSenha.type === "password";

    campoSenha.type = mostrarSenha ? "text" : "password";
    iconeToggleSenha1.classList.toggle("bi-eye", mostrarSenha);
    iconeToggleSenha1.classList.toggle("bi-eye-slash", !mostrarSenha);

    botaoToggleSenha1.setAttribute(
        "aria-label",
        mostrarSenha ? "Ocultar senha" : "Mostrar senha"
    );
});

const botaoToggleSenha2 = document.querySelector("#togglesenha2");
const iconeToggleSenha2 = botaoToggleSenha2.querySelector("i");

botaoToggleSenha2.addEventListener("click", () => {
    const mostrarSenha = campoConfirmasenha.type === "password";

    campoConfirmasenha.type = mostrarSenha ? "text" : "password";
    iconeToggleSenha2.classList.toggle("bi-eye", mostrarSenha);
    iconeToggleSenha2.classList.toggle("bi-eye-slash", !mostrarSenha);

    botaoToggleSenha2.setAttribute(
        "aria-label",
        mostrarSenha ? "Ocultar senha" : "Mostrar senha"
    );
});

function mostrarErros(campo, elementoErro, mensagem) {
    campo.classList.add("is-invalid");
    campo.closest(".input-group")?.classList.add("is-invalid");
    elementoErro.textContent = mensagem;

    const rotulo = document.querySelector(`label[for="${campo.id}"]`);
    rotulo?.classList.add("text-danger");
}

function limparErros() {
    const campos = [campoNome, campoCPF, campoTel, campoEnd, campoCEP, campoEmail, campoSenha, campoConfirmasenha];
    campos.forEach((campo) => {
        campo.classList.remove("is-invalid");
        campo.closest(".input-group")?.classList.remove("is-invalid");

        const rotulo = document.querySelector(`label[for="${campo.id}"]`);
        rotulo?.classList.remove("text-danger");
    })

    erroNome.textContent = "";
    erroCPF.textContent = "";
    erroTel.textContent = "";
    erroEnd.textContent = "";
    erroCEP.textContent = "";
    erroEmail.textContent = "";
    erroSenha.textContent = "";
    erroConfirmasenha.textContent = "";
}

function limparErroCampo(campo, elementoErro) {
    campo.classList.remove("is-invalid");
    campo.closest(".input-group")?.classList.remove("is-invalid");
    elementoErro.textContent = "";

    const rotulo = document.querySelector(`label[for="${campo.id}"]`);
    rotulo?.classList.remove("text-danger");
}

const camposComErros = [
    [campoNome, erroNome],
    [campoCPF, erroCPF],
    [campoTel, erroTel],
    [campoEnd, erroEnd],
    [campoCEP, erroCEP],
    [campoEmail, erroEmail],
    [campoSenha, erroSenha],
    [campoConfirmasenha, erroConfirmasenha]
];

camposComErros.forEach(([campo, elementoErro]) => {
    campo.addEventListener("input", () => {
        limparErroCampo(campo, elementoErro);
    });
});

function limitarDigitos(campo, limite) {
    campo.addEventListener("input", () => {
        campo.value = campo.value.replace(/\D/g, "").slice(0, limite);
    });
}

limitarDigitos(campoCPF, 11);
limitarDigitos(campoTel, 11);
limitarDigitos(campoCEP, 8);

form.addEventListener("submit", (e) => {

    let formularioValido = true;

    limparErros();

    const nome = campoNome.value.trim();
    const CPF = campoCPF.value.trim()
    const telefone = campoTel.value.trim();
    const endereco = campoEnd.value.trim();
    const cep = campoCEP.value.trim();
    const email = campoEmail.value.trim();
    const senha = campoSenha.value.trim();
    const confirmaSenha = campoConfirmasenha.value.trim();


    if (!nome) {
        mostrarErros(campoNome, erroNome, "Digite seu nome completo.");
        formularioValido = false;
    } else if (nome.length < 5) {
        mostrarErros(campoNome, erroNome, "O nome deve possuir pelo menos 5 caracteres!");
        formularioValido = false;
    } else if (nome.split(/\s+/).length < 2) {
        mostrarErro(campoNome, erroNome, "Informe nome e sobrenome!");
        formularioValido = false;
    }

    if (!CPF) {
        mostrarErros(campoCPF, erroCPF, "Informe seu CPF.");
        formularioValido = false;
    }

    if (!telefone) {
        mostrarErros(campoTel, erroTel, "Informe um número de telefone.");
        formularioValido = false;
    }

    if (!endereco) {
        mostrarErros(campoEnd, erroEnd, "Informe seu endereço.");
        formularioValido = false;
    }

    if (!cep) {
        mostrarErros(campoCEP, erroCEP, "Informe seu CEP.");
        formularioValido = false;
    }

    if (!email) {
        mostrarErros(campoEmail, erroEmail, "Digite seu e-mail.");
        formularioValido = false;
    }

    const possuiNumero1 = /[0-9]/.test(campoSenha);

    if (!campoSenha.value) {
        mostrarErros(campoSenha, erroSenha, "Digite sua senha.");
        formularioValido = false;
    } else if (campoSenha.value.length < 8) {
        mostrarErros(campoSenha, erroSenha, "A senha deve conter pelo menos 8 caracteres.");
        formularioValido = false;
    } else if (!possuiNumero1) {
        mostrarErros(campoSenha, erroSenha, "Sua senha precisa de um número");
        formularioValido = false;
    }
    
    const possuiNumero2 = /[0-9]/.test(campoConfirmasenha);

    if (!confirmaSenha) {
    mostrarErros(campoConfirmasenha, erroConfirmasenha, "Confirme sua senha.");
    formularioValido = false;
    } else if (confirmaSenha !== senha) {
    mostrarErros(campoConfirmasenha, erroConfirmasenha, "As senhas não conferem.");
    formularioValido = false;
    }

    if (formularioValido === false) {
        e.preventDefault();
    }

})