const form = document.querySelector('form');
const campologin = document.querySelector('#login')
const camposenha = document.querySelector('#senha')

const erroLogin = document.querySelector('#erroLogin')
const erroSenha = document.querySelector('#erroSenha')

const botaoToggleSenha = document.querySelector("#togglesenha");
const iconeToggleSenha = botaoToggleSenha.querySelector("i");

botaoToggleSenha.addEventListener("click", () => {
    const mostrarSenha = camposenha.type === "password";

    camposenha.type = mostrarSenha ? "text" : "password";
    iconeToggleSenha.classList.toggle("bi-eye", mostrarSenha);
    iconeToggleSenha.classList.toggle("bi-eye-slash", !mostrarSenha);

    botaoToggleSenha.setAttribute(
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
    const campos = [campologin, camposenha];
    campos.forEach((campo) => {
        campo.classList.remove("is-invalid");
        campo.closest(".input-group")?.classList.remove("is-invalid");

        const rotulo = document.querySelector(`label[for="${campo.id}"]`);
        rotulo?.classList.remove("text-danger");
    })

    erroLogin.textContent = "";
    erroSenha.textContent = "";
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    limparErros();

    const valorLogin = campologin.value.trim().toLowerCase();


    if (!valorLogin) {
        mostrarErros(campologin, erroLogin, "Informe seu login.");
    }

    const possuiMaiuscula = /[A-Z]/.test(camposenha);
    const possuiMinuscula = /[a-z]/.test(camposenha);
    const possuiNumero = /[0-9]/.test(camposenha);
    const possuiEspecial = /[_|@|!]/.test(camposenha);

    if (!camposenha.value) {
        mostrarErros(camposenha, erroSenha, "Digite sua senha.")
    } else if (camposenha.value.length < 8) {
        mostrarErros(camposenha, erroSenha, "A senha deve conter pelo menos 8 caracteres.")
    } else if (!possuiNumero) {
        mostrarErros(camposenha, erroSenha, "Sua senha precisa de um número")
    }
        
})


