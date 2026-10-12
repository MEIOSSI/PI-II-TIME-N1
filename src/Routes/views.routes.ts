import { Router, Request, Response } from "express";
import path from "path";

const router = Router();

// Ficheiros estáticos ou servir páginas HTML
router.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/Views/login/tela-login/login.html"));
});

router.get("/cadastrar-usuario", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/Views/login/tela-cadastro/cadastro.html"));
});

export default router;