// Autor: Leticya
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

//pgt p api de feriados se a data é feriado nacional
async function ehFeriado(data: string): Promise<boolean> {
    // a data vem como AAAA-MM-DD, então o ano são os 4 primeiros caracteres
    const ano = data.substring(0, 4);

    const resposta = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
    
    if (!resposta.ok) {
        throw new Error("API de feriados fora do ar");
    }

    const feriados: any[] = await resposta.json();

    // true se algum feriado tem a mesma data
    return feriados.some((feriado) => feriado.date === data);
}

// confere o prazo -o prazo é opcional, mas se vier não pode ser data errada nem feriado-
// devolve o erro {codigo, mensagem}, ou null se tá tudo certo
async function validarPrazo(prazo: string): Promise<{ codigo: number; mensagem: string } | null> {
    if (isNaN(Date.parse(prazo))) {
        return { codigo: 400, mensagem: "Prazo inválido." };
    }

    try {
        if (await ehFeriado(prazo)) {
            return { codigo: 400, mensagem: "O prazo não pode ser em um feriado nacional." };
        }
    } catch (erro) {
        // a API de fora não respondeu, então não dá p/ saber se é feriado
        return { codigo: 502, mensagem: "Não foi possível verificar se o prazo é feriado. Tente de novo." };
    }

    return null;
}

//rotas
// POST /api/demandas -quando clica em CADASTRAR na tela-
router.post("/", async (req: Request, res: Response) => {
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

     // se mandou prazo, confere se é uma data certa e se não cai em feriado
    if (prazo) {
        const erroPrazo = await validarPrazo(prazo);
        if (erroPrazo) {
            res.status(erroPrazo.codigo).json({ mensagem: erroPrazo.mensagem });
            return;
        }
    }

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

// GET /api/demandas/:id -busca uma demanda, a tela de edição usa p/ preencher o formulário-
router.get("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const demanda = demandas.find((item) => item.id === id);

    // se não achou a demanda com esse id, devolve 404
    if (!demanda) {
        res.status(404).json({ mensagem: "Demanda não encontrada." });
        return;
    }

    res.status(200).json(demanda);
});

export default router;

// PUT /api/demandas/:id -atualiza uma demanda, a tela usa quando está editando-
router.put("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const demanda = demandas.find((item) => item.id === id);

    // se não achou a demanda com esse id, devolve 404
    if (!demanda) {
        res.status(404).json({ mensagem: "Demanda não encontrada." });
        return;
    }

    const { titulo, descricao, tipo, prioridade, projetoId, prazo } = req.body;

    // mesmas validações do cadastro
    if (!titulo || !descricao || !tipo || !prioridade || !projetoId) {
        res.status(400).json({ mensagem: "Título, descrição, tipo, prioridade e projeto são obrigatórios." });
        return;
    }

    if (!tiposValidos.includes(tipo) || !prioridadesValidas.includes(prioridade)) {
        res.status(400).json({ mensagem: "Tipo ou prioridade inválidos." });
        return;
    }

    // o feriado também vale na edição
    if (prazo) {
        const erroPrazo = await validarPrazo(prazo);
        if (erroPrazo) {
            res.status(erroPrazo.codigo).json({ mensagem: erroPrazo.mensagem });
            return;
        }
    }

    demanda.titulo = titulo;
    demanda.descricao = descricao;
    demanda.tipo = tipo;
    demanda.prioridade = prioridade;
    demanda.projetoId = projetoId;
    demanda.prazo = prazo;
    // o status e a data de criação não mudam aqui
    // as transições de status são outra parte do sistema, com regras e permissões
    demanda.dataAtualizacao = new Date().toISOString(); // atualiza a data sozinho

    res.status(200).json(demanda);
});