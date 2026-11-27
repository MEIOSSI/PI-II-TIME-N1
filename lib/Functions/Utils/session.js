"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioDaSessao = usuarioDaSessao;
exports.criarSessao = criarSessao;
exports.encerrarSessao = encerrarSessao;
exports.carregarUsuarioDaSessao = carregarUsuarioDaSessao;
const node_crypto_1 = require("node:crypto");
const NOME_COOKIE = "pi2.sid";
const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000;
const DURACAO_COOKIE_SEGUNDOS = DURACAO_SESSAO_MS / 1000;
const sessoes = new Map();
function idDoCookie(cookieHeader) {
    var _a;
    return (_a = cookieHeader === null || cookieHeader === void 0 ? void 0 : cookieHeader.split(";").map(cookie => cookie.trim()).find(cookie => cookie.startsWith(`${NOME_COOKIE}=`))) === null || _a === void 0 ? void 0 : _a.slice(NOME_COOKIE.length + 1);
}
function usuarioDaSessao(cookieHeader) {
    const id = idDoCookie(cookieHeader);
    if (!id)
        return undefined;
    const sessao = sessoes.get(id);
    if (!sessao)
        return undefined;
    if (sessao.expiraEm <= Date.now()) {
        sessoes.delete(id);
        return undefined;
    }
    return sessao.usuario;
}
function criarSessao(usuario, res) {
    const id = (0, node_crypto_1.randomBytes)(32).toString("hex");
    sessoes.set(id, { usuario, expiraEm: Date.now() + DURACAO_SESSAO_MS });
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader("Set-Cookie", `${NOME_COOKIE}=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${DURACAO_COOKIE_SEGUNDOS}${secure}`);
}
function encerrarSessao(cookieHeader, res) {
    const id = idDoCookie(cookieHeader);
    if (id)
        sessoes.delete(id);
    res.setHeader("Set-Cookie", `${NOME_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}
function carregarUsuarioDaSessao(req, _res, next) {
    req.usuario = usuarioDaSessao(req.headers.cookie);
    next();
}
//# sourceMappingURL=session.js.map