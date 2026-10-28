//Importar todas as rotas presentes para enviar de uma unica vez ao app.ts
import { Router } from "express";

import demandasRoutes from "./demandas.routes";
import viewsRoutes from "./views.routes";
import authRoutes from "./auth.routes";


const router = Router();

// Rotas da API (retornam JSON)
router.use("/api", demandasRoutes);

// Rotas visuais/páginas (retornam HTML)
router.use("/", viewsRoutes);

// Rota validação senha
router.use("/api/auth", authRoutes);

export default router;