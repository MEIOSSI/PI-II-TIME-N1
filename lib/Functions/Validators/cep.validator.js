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
exports.validarCEP = validarCEP;
function validarCEP(cep) {
    return __awaiter(this, void 0, void 0, function* () {
        const numeros = cep.replace(/\D/g, "");
        // Primeiro, verifica o formato
        if (numeros.length !== 8) {
            return false;
        }
        const resposta = yield fetch(`https://viacep.com.br/ws/${numeros}/json/`);
        if (!resposta.ok) {
            throw new Error("Não foi possível consultar o CEP.");
        }
        const dados = (yield resposta.json());
        // O ViaCEP retorna erro quando o CEP não existe
        if (dados.erro) {
            return false;
        }
        return true;
    });
}
//# sourceMappingURL=cep.validator.js.map