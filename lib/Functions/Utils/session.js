"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioDaSessao = usuarioDaSessao;
exports.criarSessao = criarSessao;
exports.encerrarSessao = encerrarSessao;
exports.carregarUsuarioDaSessao = carregarUsuarioDaSessao;
const node_crypto_1 = require("node:crypto");
const COOKIE_SESSAO = "pi2.sid";
const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000;
const sessoes = new Map();
function lerCookie(cookieHeader) {
    const cookie = cookieHeader === null || cookieHeader === void 0 ? void 0 : cookieHeader.split(";").map(parte => parte.trim()).find(parte => parte.startsWith(`${COOKIE_SESSAO}=`));
    return cookie === null || cookie === void 0 ? void 0 : cookie.slice(COOKIE_SESSAO.length + 1);
}
function usuarioDaSessao(cookieHeader) {
    const idSessao = lerCookie(cookieHeader);
    if (!idSessao)
        return undefined;
    const sessao = sessoes.get(idSessao);
    if (!sessao)
        return undefined;
    if (sessao.expiraEm <= Date.now()) {
        sessoes.delete(idSessao);
        return undefined;
    }
    return sessao.usuario;
}
function criarSessao(usuario, res) {
    const idSessao = (0, node_crypto_1.randomBytes)(32).toString("hex");
    sessoes.set(idSessao, { usuario, expiraEm: Date.now() + DURACAO_SESSAO_MS });
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader("Set-Cookie", `${COOKIE_SESSAO}=${idSessao}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${secure}`);
}
function encerrarSessao(cookieHeader, res) {
    const idSessao = lerCookie(cookieHeader);
    if (idSessao)
        sessoes.delete(idSessao);
    res.setHeader("Set-Cookie", `${COOKIE_SESSAO}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}
function carregarUsuarioDaSessao(req, _res, next) {
    req.usuario = usuarioDaSessao(req.headers.cookie);
    next();
}
//# sourceMappingURL=session.js.map