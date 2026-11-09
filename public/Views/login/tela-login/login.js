// por: Vitor Hugo Turati Ianagui - 26025950
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

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErros();

    const valorLogin = campologin.value.trim().toLowerCase();
    const valorSenha = camposenha.value;
    let formularioValido = true;

    if (!valorLogin) {
        mostrarErros(campologin, erroLogin, "Informe seu login.");
        formularioValido = false;
    }

    // No login só verificamos se a senha foi digitada;
    // a comparação com o hash é feita no backend
    if (!valorSenha) {
        mostrarErros(camposenha, erroSenha, "Digite sua senha.");
        formularioValido = false;
    }

    if (!formularioValido) {
        return;
    }

    try {
        const resposta = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: valorLogin, senha: valorSenha })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            const mensagens = resultado.erros || [];

            mensagens.forEach((mensagem) => {
                if (mensagem.toLowerCase().includes("e-mail")) {
                    mostrarErros(campologin, erroLogin, mensagem);
                } else {
                    mostrarErros(camposenha, erroSenha, mensagem);
                }
            });

            // 401: e-mail ou senha incorretos
            if (mensagens.length === 0) {
                mostrarErros(camposenha, erroSenha, resultado.mensagem || "Não foi possível entrar.");
            }
            return;
        }

        // Guarda os dados do usuário (sem senha) para as próximas telas
        sessionStorage.setItem("usuario", JSON.stringify(resultado.usuario));
        window.location.href = "/Views/telaProjetos/projetos.html";
    } catch (erro) {
        console.error("Erro ao realizar login:", erro);
        alert("Não foi possível conectar ao servidor. Tente novamente.");
    }
})


