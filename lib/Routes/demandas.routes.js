"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const demandas_types_1 = require("../Functions/Utils/demandas.types");
const router = (0, express_1.Router)();
let Demandas = [
    {
        id: 1,
        titulo: "estou demandando isso",
        descricao: "string",
        tipo: "Tarefa",
        responsavel: (0, demandas_types_1.criarMembro)(1, "Murilo Lopes"),
        prioridade: "Alta",
        comentarios: [
            {
                id: 1,
                texto: "comentário genérico lorem ipsum",
                autor: (0, demandas_types_1.criarMembro)(1, "Murilo"),
                publicacao: new Date(),
            },
            {
                id: 2,
                texto: "comentário genérico lorem ipsum",
                autor: (0, demandas_types_1.criarMembro)(1, "Murilo"),
                publicacao: new Date(),
            }
        ]
    },
    {
        id: 2,
        titulo: "Esta demanda é uma demanda",
        descricao: "Descrição da demanda",
        tipo: "Tarefa",
        responsavel: (0, demandas_types_1.criarMembro)(1, "Murilo Lopes"),
        prioridade: "Alta",
        comentarios: [
            {
                id: 1,
                texto: "comentário genérico lorem ipsum",
                autor: (0, demandas_types_1.criarMembro)(1, "Murilo"),
                publicacao: new Date(),
            },
            {
                id: 2,
                texto: "comentário genérico lorem ipsum",
                autor: (0, demandas_types_1.criarMembro)(1, "Murilo"),
                publicacao: new Date(),
            }
        ]
    }
];
exports.default = router;
//# sourceMappingURL=demandas.routes.js.map