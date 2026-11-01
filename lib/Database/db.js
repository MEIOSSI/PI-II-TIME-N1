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
exports.conectarBanco = conectarBanco;
exports.executarConsulta = executarConsulta;
exports.fecharBanco = fecharBanco;
const oracledb = require("oracledb");
require("dotenv/config");
const user = process.env.ORACLE_USER;
const password = process.env.ORACLE_PASSWORD;
const connectString = process.env.ORACLE_CONNECT_STRING;
function conectarBanco() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!user || !password || !connectString) {
            throw new Error("As variáveis de conexão Oracle não foram configuradas no .env");
        }
        // Evita criar o pool novamente
        try {
            oracledb.getPool();
            return;
        }
        catch (_a) {
            // Pool ainda não existe
        }
        yield oracledb.createPool({
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
    });
}
function executarConsulta(sql_1) {
    return __awaiter(this, arguments, void 0, function* (sql, binds = {}) {
        var _a;
        const pool = oracledb.getPool();
        const conexao = yield pool.getConnection();
        try {
            const resultado = yield conexao.execute(sql, binds, {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            });
            return ((_a = resultado.rows) !== null && _a !== void 0 ? _a : []);
        }
        finally {
            yield conexao.close();
        }
    });
}
function fecharBanco() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = oracledb.getPool();
            yield pool.close(10);
            console.log("Pool Oracle encerrado.");
        }
        catch (_a) {
            console.log("Nenhum pool Oracle estava aberto.");
        }
    });
}
//# sourceMappingURL=db.js.map