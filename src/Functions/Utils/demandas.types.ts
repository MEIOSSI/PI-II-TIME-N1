// pseudo banco
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
