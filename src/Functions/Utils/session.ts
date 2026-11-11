import { randomBytes } from "node:crypto";
import { Request, Response, NextFunction } from "express";

export type UsuarioSessao = { id: number; nome: string; email: string; perfil: string };
type Sessao = { usuario: UsuarioSessao; expiraEm: number };

const COOKIE_SESSAO = "pi2.sid";
const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000;
const sessoes = new Map<string, Sessao>();

function lerCookie(cookieHeader: string | undefined): string | undefined {
    const cookie = cookieHeader?.split(";").map(parte => parte.trim())
        .find(parte => parte.startsWith(`${COOKIE_SESSAO}=`));
    return cookie?.slice(COOKIE_SESSAO.length + 1);
}

export function usuarioDaSessao(cookieHeader: string | undefined): UsuarioSessao | undefined {
    const idSessao = lerCookie(cookieHeader);
    if (!idSessao) return undefined;

    const sessao = sessoes.get(idSessao);
    if (!sessao) return undefined;
    if (sessao.expiraEm <= Date.now()) {
        sessoes.delete(idSessao);
        return undefined;
    }
    return sessao.usuario;
}

export function criarSessao(usuario: UsuarioSessao, res: Response): void {
    const idSessao = randomBytes(32).toString("hex");
    sessoes.set(idSessao, { usuario, expiraEm: Date.now() + DURACAO_SESSAO_MS });
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader("Set-Cookie", `${COOKIE_SESSAO}=${idSessao}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${secure}`);
}

export function encerrarSessao(cookieHeader: string | undefined, res: Response): void {
    const idSessao = lerCookie(cookieHeader);
    if (idSessao) sessoes.delete(idSessao);
    res.setHeader("Set-Cookie", `${COOKIE_SESSAO}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

export function carregarUsuarioDaSessao(req: Request, _res: Response, next: NextFunction): void {
    (req as Request & { usuario?: UsuarioSessao }).usuario = usuarioDaSessao(req.headers.cookie);
    next();
}
