const form = document.querySelector('form');
const campoNovasenha = document.querySelector('#novasenha')
const campoConfirmasenha = document.querySelector('#confirmanovasenha')

const erroNovasenha = document.querySelector('#erroNovasenha')
const erroConfirmasenha = document.querySelector('#erroConfirmasenha')

const botaoToggleSenha1 = document.querySelector("#togglesenha1");
const iconeToggleSenha1 = botaoToggleSenha1.querySelector("i");

botaoToggleSenha1.addEventListener("click", () => {
    const mostrarSenha = campoNovasenha.type === "password";

    campoNovasenha.type = mostrarSenha ? "text" : "password";
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
    const campos = [campoNovasenha, campoConfirmasenha];
    campos.forEach((campo) => {
        campo.classList.remove("is-invalid");
        campo.closest(".input-group")?.classList.remove("is-invalid");

        const rotulo = document.querySelector(`label[for="${campo.id}"]`);
        rotulo?.classList.remove("text-danger");
    })

    erroNovasenha.textContent = "";
    erroConfirmasenha.textContent = "";
}

form.addEventListener("input", limparErros);

form.addEventListener("submit", (e) => {
    let formularioValido = true;

    const valorNovasenha = campoNovasenha;

    const possuiNumero1 = /[0-9]/.test(campoNovasenha.value);

    if (!valorNovasenha.value) {
        mostrarErros(campoNovasenha, erroNovasenha, "Digite sua nova senha.");
        formularioValido = false;
    } else if (campoNovasenha.value.length < 8) {
        mostrarErros(campoNovasenha, erroNovasenha, "A senha deve conter pelo menos 8 caracteres.");
        formularioValido = false;
    } else if (!possuiNumero1) {
        mostrarErros(campoNovasenha, erroNovasenha, "Sua senha precisa de um número");
        formularioValido = false;
    }

    const possuiNumero2 = /[0-9]/.test(campoConfirmasenha.value);

    if (!campoConfirmasenha.value) {
        mostrarErros(campoConfirmasenha, erroConfirmasenha, "Digite sua senha.");
        formularioValido = false;
    } else if (campoConfirmasenha.value.length < 8) {
        mostrarErros(campoConfirmasenha, erroConfirmasenha, "A senha deve conter pelo menos 8 caracteres.");
        formularioValido = false;
    } else if (!possuiNumero2) {
        mostrarErros(campoConfirmasenha, erroConfirmasenha, "Sua senha precisa de um número");
        formularioValido = false;
    }
        
    if (valorNovasenha.value !== campoConfirmasenha.value) {
        mostrarErros(campoConfirmasenha, erroConfirmasenha, "A senha não corresponde com a anterior.");
        formularioValido = false;
    }

    if (formularioValido === false) {
        e.preventDefault()
    }

})

