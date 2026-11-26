import { randomBytes } from "node:crypto";
import { Request, Response, NextFunction } from "express";

export type UsuarioSessao = { id: number; nome: string; email: string; perfil: string };

const NOME_COOKIE = "pi2.sid";
const DURACAO_SESSAO_MS = 8 * 60 * 60 * 1000;
const DURACAO_COOKIE_SEGUNDOS = DURACAO_SESSAO_MS / 1000;
const sessoes = new Map<string, { usuario: UsuarioSessao; expiraEm: number }>();

function idDoCookie(cookieHeader?: string): string | undefined {
    return cookieHeader
        ?.split(";")
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith(`${NOME_COOKIE}=`))
        ?.slice(NOME_COOKIE.length + 1);
}

export function usuarioDaSessao(cookieHeader?: string): UsuarioSessao | undefined {
    const id = idDoCookie(cookieHeader);
    if (!id) return undefined;

    const sessao = sessoes.get(id);
    if (!sessao) return undefined;
    if (sessao.expiraEm <= Date.now()) {
        sessoes.delete(id);
        return undefined;
    }

    return sessao.usuario;
}

export function criarSessao(usuario: UsuarioSessao, res: Response): void {
    const id = randomBytes(32).toString("hex");
    sessoes.set(id, { usuario, expiraEm: Date.now() + DURACAO_SESSAO_MS });

    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader(
        "Set-Cookie",
        `${NOME_COOKIE}=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${DURACAO_COOKIE_SEGUNDOS}${secure}`
    );
}

export function encerrarSessao(cookieHeader: string | undefined, res: Response): void {
    const id = idDoCookie(cookieHeader);
    if (id) sessoes.delete(id);

    res.setHeader("Set-Cookie", `${NOME_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

export function carregarUsuarioDaSessao(req: Request, _res: Response, next: NextFunction): void {
    (req as Request & { usuario?: UsuarioSessao }).usuario = usuarioDaSessao(req.headers.cookie);
    next();
}
