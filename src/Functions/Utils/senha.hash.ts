// por: Vitor Hugo Turati Ianagui - <RA>
// Funções de hash de senha (bcrypt). O banco guarda só o hash, nunca a senha.

import bcrypt from "bcryptjs";

// Custo 10: o mesmo dos hashes de teste
const CUSTO_HASH = 10;

// Usado quando o e-mail não existe: a comparação roda do mesmo jeito,
// então o tempo de resposta não revela se o e-mail está cadastrado.
const HASH_FICTICIO = bcrypt.hashSync("senha-ficticia", CUSTO_HASH);

export async function gerarHashSenha(senha: string): Promise<string> {
    return bcrypt.hash(senha, CUSTO_HASH);
}

export async function compararSenha(
    senha: string,
    hashSalvo: string | null | undefined
): Promise<boolean> {
    if (!hashSalvo) {
        await bcrypt.compare(senha, HASH_FICTICIO);
        return false;
    }
    return bcrypt.compare(senha, hashSalvo);
}