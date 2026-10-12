import express, {Request, Response} from "express";
import path from 'path';    
const app = express();
const port = 9090;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

type cursoAluno = "Engenharia de software" | "Sistemas de informação";
type situacaoAluno = "Ativo" | "Formado" | "Trancado" | "Inativo";

interface Aluno{
    ra: number,
    nome: string,
    email: string,
    curso: cursoAluno,
    semestre: number,
    situacao: situacaoAluno,
}

let alunos:Aluno[] = [
    {
    ra: 1,
    nome: "murilo",
    email: "iossimurilo@gmail.com",
    curso: "Engenharia de software",
    semestre: 2,
    situacao: "Ativo",
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
   return res.status(200).json(alunos);
})

app.post("/alunos", (req:Request, res:Response)=>{  
    const {ra, nome, email, curso, semestre} = req.body

    //Validações
    const novoAluno:Aluno = {ra, nome, email, curso, semestre, situacao:"Ativo"};

    alunos.push();
    return res.status(201).json(novoAluno);

})