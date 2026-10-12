import { Router, Request, Response } from "express";
import { Demanda, criarMembro } from "../Functions/Utils/demandas.types";

const router = Router();

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

export default router;