//172.16.12.14 ao invés de BD-ACD
const oracledb = require('oracledb');
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

    await oracledb.createPool({
        user,
        password,
        connectString,
        poolMin: 1,
        poolMax: 5,
        poolIncrement: 1,
    });

    console.log("Pool de conexões Oracle criado.");
}

export async function executarConsulta<T = Record<string, unknown>>(
    sql: string,
    binds: Record<string, unknown> = {}
): Promise<T[]> {
    const pool = oracledb.getPool();
    const conexao = await pool.getConnection();

    try {
        const resultado = await conexao.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        });

        return (resultado.rows ?? []) as T[];
    } finally {
        await conexao.close();
    }
}

export async function fecharBanco(): Promise<void> {
    const pool = oracledb.getPool();
    await pool.close(10);
}