//Feito por: Leticya Fernandes - RA: 26896423

const oracledb = require("oracledb");

export const BIND_OUT = oracledb.BIND_OUT;
export const TIPO_NUMERO = oracledb.NUMBER;

export async function executar(
    sql: string,
    binds: Record<string, unknown> = {}
): Promise<any> {

    const pool = oracledb.getPool();
    const conexao = await pool.getConnection();

    try {

        const resultado = await conexao.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,

            fetchInfo: { DESCRICAO: { type: oracledb.STRING } },

            // é isso que salva no banco
            autoCommit: true
        });

        return resultado;

    } finally {
        await conexao.close();
    }
}