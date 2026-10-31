// rota do cadastro de demandas
import { Router, Request, Response } from "express";

// mini-servidor só pro cadastro, o app.ts que liga ele lá
const router = Router();

//pseudo-banco
// as demandas ficam aqui na memória, quando reinicia o servidor some tudo
// quando o banco ficar pronto isso vira um INSERT
let demandas: any[] = [];
let proximoId = 1;

// o que o servidor aceita, se vier outra coisa leva 400
const tiposValidos = ["Tarefa", "Defeito", "Melhoria", "Documentação"];
const prioridadesValidas = ["Crítica", "Alta", "Média", "Baixa"];
// fim do pseudo-banco

//rotas
// POST /api/demandas -quando clica em CADASTRAR na tela-
router.post("/", (req: Request, res: Response) => {
    // desmonta o que a tela mandou, cada campo vira uma variável
    const { titulo, descricao, tipo, prioridade, projetoId, prazo } = req.body;

    // se faltar algo obrigatório já devolve 400 e para por aqui
    if (!titulo || !descricao || !tipo || !prioridade || !projetoId) {
        res.status(400).json({ mensagem: "Título, descrição, tipo, prioridade e projeto são obrigatórios." });
        return;
    }

    // confere se o tipo e a prioridade são dos que existem mesmo
    if (!tiposValidos.includes(tipo) || !prioridadesValidas.includes(prioridade)) {
        res.status(400).json({ mensagem: "Tipo ou prioridade inválidos." });
        return;
    }

    // TODO: validar o prazo e ver na API se é feriado, ainda n fiz

    const agora = new Date().toISOString();

    const novaDemanda = {
        id: proximoId,
        titulo,
        descricao,
        tipo,
        prioridade,
        projetoId,
        prazo,
        status: "Aberta",     // toda demanda nasce aberta, quem decide isso é o servidor
        dataCriacao: agora,   // as datas também são automáticas, a pessoa n preenche
        dataAtualizacao: agora
    };

    demandas.push(novaDemanda);
    proximoId++;

    // 201 = criou certinho
    res.status(201).json(novaDemanda);
});

export default router;