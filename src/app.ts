import express, {Request, Response} from "express";
import path from 'path';    
const app = express();
const port = 9090;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

type tipoDemanda = "" |  "de informação";
type membroProj = "Ativo" | "Formado" | "Trancado" | "Inativo";
type prioridadeDemanda = "Ativo" | "Formado" | "Trancado" | "Inativo";

interface Demanda{
    id: string,
    titulo: string,
    descricao: string,
    tipo: tipoDemanda,
    responsavel: membroProj,
    prioridade: prioridadeDemanda,
}

let Demandas:Demanda[] = [
    {
    id: "string",
    titulo: "string",
    descricao: "string",
    tipo: "",
    responsavel: "Ativo",
    prioridade: "Formado",
    }
]

app.listen(port, ()=>{
    console.log(`Server initialized on ${port}`);
});

app.use("/", (req:Request, res:Response) => {
    res.sendFile(path.join(__dirname, 'public/Views/login/tela-login/login.html'));
});

app.use("/cadastrar-usuario", (req:Request, res:Response) => {
    res.sendFile(path.join(__dirname, 'public/Views/login/tela-cadastro/cadastro.html'))
})

app.get("/alunos", (req:Request, res:Response)=> {
   return res.status(200).json(Demandas);
})
