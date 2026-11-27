// por: Vitor Hugo Turati Ianagui - <26025950>
// Funções de hash de senha (bcrypt)

import bcrypt from "bcryptjs";

const CUSTO_HASH = 10;

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