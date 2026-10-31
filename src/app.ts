import Express, {Request, Response} from "express";
import path from "path";
import cadastroRoutes from "./cadastro.routes";
const app = Express();
const port = 9090;

app.use(Express.json());
app.use(Express.static(path.join(__dirname, "public")));

//pseudo-banco
export type TipoDemanda = "Tarefa" |  "Defeito" | "Melhoria" | "Documentação";
export type PrioridadeDemanda = "Critica" | "Alta" | "Média" | "Baixa";

export interface MembroProj{
    id: number,
    nome: string,
}

export function criarMembro(id: number, nome: string): MembroProj {
  return { id, nome };
}

export interface Comentario{
    id: number,
    texto: string,
    autor: MembroProj,
    publicacao: Date;
}

export interface Demanda{
    id: number,
    titulo: string,
    descricao: string,
    tipo: TipoDemanda,
    responsavel:  MembroProj,
    prioridade: PrioridadeDemanda,
    comentarios: Comentario[];
}

let Demandas:Demanda[] = [
    {
    id: 1,
    titulo: "estou demandando isso",
    descricao: "string",
    tipo: "Tarefa",
    responsavel: criarMembro(1, "Murilo Lopes"),
    prioridade: "Alta",
    comentarios: [
        {
            id: 1,
            texto: "comentário genérico lorem ipsum",
            autor: criarMembro(1, "Murilo"),
            publicacao: new Date(),
        },

        {
            id: 2,
            texto: "comentário genérico lorem ipsum",
            autor: criarMembro(1, "Murilo"),
            publicacao: new Date(),
        }

    ]
    },

    {
    id: 2,
    titulo: "Esta demanda é uma demanda",
    descricao: "Descrição da demanda",
    tipo: "Tarefa",
    responsavel: criarMembro(1, "Murilo Lopes"),
    prioridade: "Alta",
    comentarios: [
        {
            id: 1,
            texto: "comentário genérico lorem ipsum",
            autor: criarMembro(1, "Murilo"),
            publicacao: new Date(),
        },

        {
            id: 2,
            texto: "comentário genérico lorem ipsum",
            autor: criarMembro(1, "Murilo"),
            publicacao: new Date(),
        }

    ]
    }
]
// fim do pseudo-banco
Demandas // -> isso aqui é inutil, só pro tsc n encher o saco
//rotas
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/Views/login/tela-login/login.html"));
});

app.get("/cadastrar-usuario", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/Views/login/tela-cadastro/cadastro.html"));
});

//cadastro demandas 
app.use("/api/demandas", cadastroRoutes);

//Inicialização do servidor (SEMPRE no final)
app.listen(port, () => {
  console.log(`Servidor iniciado em: http://localhost:${port}`);
});