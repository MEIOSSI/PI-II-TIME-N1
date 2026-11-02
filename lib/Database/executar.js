"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIPO_NUMERO = exports.BIND_OUT = void 0;
exports.executar = executar;
const oracledb = require("oracledb");
exports.BIND_OUT = oracledb.BIND_OUT;
exports.TIPO_NUMERO = oracledb.NUMBER;
function executar(sql_1) {
    return __awaiter(this, arguments, void 0, function* (sql, binds = {}) {
        const pool = oracledb.getPool();
        const conexao = yield pool.getConnection();
        try {
            const resultado = yield conexao.execute(sql, binds, {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
                fetchInfo: { DESCRICAO: { type: oracledb.STRING } },
                // é isso que salva no banco
                autoCommit: true
            });
            return resultado;
        }
        finally {
            yield conexao.close();
        }
    });
}
//# sourceMappingURL=executar.js.map