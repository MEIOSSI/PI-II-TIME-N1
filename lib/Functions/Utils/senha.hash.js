"use strict";
// por: Vitor Hugo Turati Ianagui - <RA>
// Funções de hash de senha (bcrypt). O banco guarda só o hash, nunca a senha.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarHashSenha = gerarHashSenha;
exports.compararSenha = compararSenha;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Custo 10: o mesmo dos hashes de teste
const CUSTO_HASH = 10;
// Usado quando o e-mail não existe: a comparação roda do mesmo jeito,
// então o tempo de resposta não revela se o e-mail está cadastrado.
const HASH_FICTICIO = bcryptjs_1.default.hashSync("senha-ficticia", CUSTO_HASH);
function gerarHashSenha(senha) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.hash(senha, CUSTO_HASH);
    });
}
function compararSenha(senha, hashSalvo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!hashSalvo) {
            yield bcryptjs_1.default.compare(senha, HASH_FICTICIO);
            return false;
        }
        return bcryptjs_1.default.compare(senha, hashSalvo);
    });
}
//# sourceMappingURL=senha.hash.js.map