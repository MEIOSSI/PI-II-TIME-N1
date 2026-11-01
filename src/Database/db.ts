const oracledb = require("oracledb");
import "dotenv/config";

const user = process.env.ORACLE_USER;
const password = process.env.ORACLE_PASSWORD;
const connectString = process.env.ORACLE_CONNECT_STRING;

export async function conectarBanco(): Promise<void> {

    if (!user || !password || !connectString) {
        throw new Error(
            "As variáveis de conexão Oracle não foram configuradas no .env"
        );
    }

    // Evita criar o pool novamente
    try {
        oracledb.getPool();
        return;
    } catch {
        // Pool ainda não existe
    }

    await oracledb.createPool({
        user,
        password,
        connectString,

        poolMin: 1,
        poolMax: 5,
        poolIncrement: 1,

        poolTimeout: 60,
        queueTimeout: 60000
    });

    console.log("Pool de conexões Oracle criado.");
}

export async function executarConsulta<
    T = Record<string, unknown>
>(
    sql: string,
    binds: Record<string, unknown> = {}
): Promise<T[]> {

    const pool = oracledb.getPool();
    const conexao = await pool.getConnection();

    try {

        const resultado = await conexao.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });

        return (resultado.rows ?? []) as T[];

    } finally {
        await conexao.close();
    }
}

export async function fecharBanco(): Promise<void> {

    try {
        const pool = oracledb.getPool();
        await pool.close(10);

        console.log("Pool Oracle encerrado.");

    } catch {
        console.log("Nenhum pool Oracle estava aberto.");
    }
}