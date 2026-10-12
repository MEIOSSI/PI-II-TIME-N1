"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 9090;
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
let alunos = [
    {
        ra: 1,
        nome: "murilo",
        email: "iossimurilo@gmail.com",
        curso: "Engenharia de software",
        semestre: 2,
        situacao: "Ativo",
    }
];
app.listen(port, () => {
    console.log(`Server initialized on ${port}`);
});
app.use("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public/Views/login/tela-login/login.html'));
});
app.use("/cadastrar-usuario", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public/Views/login/tela-cadastro/cadastro.html'));
});
app.get("/alunos", (req, res) => {
    return res.status(200).json(alunos);
});
app.post("/alunos", (req, res) => {
    const { ra, nome, email, curso, semestre } = req.body;
    //Validações
    const novoAluno = { ra, nome, email, curso, semestre, situacao: "Ativo" };
    alunos.push();
    return res.status(201).json(novoAluno);
});
//# sourceMappingURL=app.js.map