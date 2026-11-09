// por: Vitor Hugo Turati Ianagui - 26025950
const form = document.querySelector('form');
const campoNovasenha = document.querySelector('#novasenha')
const campoConfirmasenha = document.querySelector('#confirmanovasenha')

const erroNovasenha = document.querySelector('#erroNovasenha')
const erroConfirmasenha = document.querySelector('#erroConfirmasenha')

const botaoToggleSenha1 = document.querySelector("#togglesenha1");
const iconeToggleSenha1 = botaoToggleSenha1.querySelector("i");

const campoEmail = document.querySelector('#email')
const campoSenhaatual = document.querySelector('#senhaatual')

const erroEmail = document.querySelector('#erroEmail')
const erroSenhaatual = document.querySelector('#erroSenhaatual')

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
        const campos = [campoEmail, campoSenhaatual, campoNovasenha, campoConfirmasenha];
    campos.forEach((campo) => {
        campo.classList.remove("is-invalid");
        campo.closest(".input-group")?.classList.remove("is-invalid");

        const rotulo = document.querySelector(`label[for="${campo.id}"]`);
        rotulo?.classList.remove("text-danger");
    })

    erroNovasenha.textContent = "";
    erroConfirmasenha.textContent = "";
    erroEmail.textContent = "";
    erroSenhaatual.textContent = "";
}

form.addEventListener("input", limparErros);

// Coloca cada mensagem de erro do backend embaixo do campo correspondente.
// A ordem importa: as frases mais específicas são testadas primeiro.
function mostrarErrosDoBackend(mensagens) {
    let encontrouCampo = false;

    mensagens.forEach((mensagem) => {
        const texto = mensagem.toLowerCase();

        if (texto.includes("conferem") || texto.includes("confirme")) {
            mostrarErros(campoConfirmasenha, erroConfirmasenha, mensagem);
        } else if (texto.includes("nova senha")) {
            mostrarErros(campoNovasenha, erroNovasenha, mensagem);
        } else if (texto.includes("senha atual")) {
            mostrarErros(campoSenhaatual, erroSenhaatual, mensagem);
        } else if (texto.includes("e-mail")) {
            mostrarErros(campoEmail, erroEmail, mensagem);
        } else if (texto.includes("senha")) {
            mostrarErros(campoNovasenha, erroNovasenha, mensagem);
        } else {
            return;
        }
        encontrouCampo = true;
    });

    if (!encontrouCampo && mensagens.length > 0) {
        alert(mensagens.join("\n"));
    }
}

form.addEventListener("submit", async (e) => {
    // Sempre envia via fetch, sem recarregar a página
    e.preventDefault();
    limparErros();

    let formularioValido = true;

    const email = campoEmail.value.trim();
    const senhaAtual = campoSenhaatual.value;
    const novaSenha = campoNovasenha.value;
    const confirmaNovaSenha = campoConfirmasenha.value;

    // Validações rápidas no navegador; as regras completas ficam no backend
    if (!email) {
        mostrarErros(campoEmail, erroEmail, "Informe seu e-mail.");
        formularioValido = false;
    }

    if (!senhaAtual) {
        mostrarErros(campoSenhaatual, erroSenhaatual, "Digite sua senha atual.");
        formularioValido = false;
    }

    if (!novaSenha) {
        mostrarErros(campoNovasenha, erroNovasenha, "Digite sua nova senha.");
        formularioValido = false;
    } else if (novaSenha.length < 8) {
        mostrarErros(campoNovasenha, erroNovasenha, "A senha deve conter pelo menos 8 caracteres.");
        formularioValido = false;
    }

    if (!confirmaNovaSenha) {
        mostrarErros(campoConfirmasenha, erroConfirmasenha, "Confirme sua nova senha.");
        formularioValido = false;
    } else if (novaSenha !== confirmaNovaSenha) {
        mostrarErros(campoConfirmasenha, erroConfirmasenha, "A senha não corresponde com a anterior.");
        formularioValido = false;
    }

    if (!formularioValido) {
        return;
    }

    try {
        const resposta = await fetch("/api/auth/redefinir-senha", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senhaAtual, novaSenha, confirmaNovaSenha })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            const mensagens = resultado.erros || [];

            if (mensagens.length > 0) {
                mostrarErrosDoBackend(mensagens);
            } else {
                alert(resultado.mensagem || "Não foi possível redefinir a senha.");
            }
            return;
        }

        alert(resultado.mensagem);
        window.location.href = "/"; // volta para o login
    } catch (erro) {
        console.error("Erro ao redefinir senha:", erro);
        alert("Não foi possível conectar ao servidor. Tente novamente.");
    }
})

