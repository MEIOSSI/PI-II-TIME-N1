# PI-II-TIME-N1 — Sistema de Acompanhamento de Demandas

Aplicação web para equipes organizarem projetos e acompanharem demandas de desenvolvimento. Usuários podem criar e consultar projetos e demandas, acompanhar responsáveis, prioridades, prazos, mudanças de status e histórico, além de trocar comentários em tempo real. O acesso às funcionalidades é feito por conta de usuário e respeita os papéis de administrador, líder de projeto e membro da equipe.

## Equipe

- Camille da Silva Chagas
- Leticya Karen Marques Fernandes
- Murilo Luis Iossi Lopes
- Valentina Bastos de Souza
- Vitor Hugo Turati Ianagui

**Curso:** Engenharia de Software  
**Componente:** Projeto Integrador II  
**Semestre:** 2º semestre de 2026  
**Professor orientador:** Fernando Luiz de Almeida Silveira

## Tecnologias

- Node.js, TypeScript e Express no servidor;
- HTML, CSS e JavaScript no navegador;
- Oracle Database, acessado pelo driver `oracledb`;
- Socket.IO para comentários em tempo real.

## Requisitos para executar

- Node.js e npm instalados;
- uma instância Oracle Database acessível, com usuário e senha válidos;
- conectividade entre o computador/servidor de aplicação e o Oracle. Para usar o banco da PUC, pode ser necessário estar na rede da instituição ou conectado à VPN institucional.

O projeto não inclui uma instância Oracle, credenciais, dados de demonstração nem configuração de hospedagem automática. Para uma implantação de testes, disponibilize um servidor Node.js e um banco Oracle acessível, configure as variáveis de ambiente e siga os passos abaixo. Não há configuração Docker neste repositório.

## Preparar o banco Oracle

Use um schema vazio e um usuário com permissão para criar tabelas. No Oracle SQL Developer ou ferramenta equivalente, execute **uma vez cada** script abaixo, nesta ordem:

1. [`src/Database/scripts/pi2Usuarios.sql`](src/Database/scripts/pi2Usuarios.sql)
2. [`src/Database/scripts/pi2Projetos.sql`](src/Database/scripts/pi2Projetos.sql)
3. [`src/Database/scripts/pi2MembrosDosProjetos.sql`](src/Database/scripts/pi2MembrosDosProjetos.sql)
4. [`src/Database/scripts/pi2Demandas.sql`](src/Database/scripts/pi2Demandas.sql)
5. [`src/Database/scripts/pi2HistoricosDeDemandas.sql`](src/Database/scripts/pi2HistoricosDeDemandas.sql)
6. [`src/Database/scripts/pi2Comentarios.sql`](src/Database/scripts/pi2Comentarios.sql)

Esses scripts criam as tabelas usadas pelo código atual (`pi2Usuarios`, `pi2Projetos`, `pi2MembrosDosProjetos`, `pi2Demandas`, `pi2HistoricosDeDemandas` e `pi2Comentarios`). O arquivo [`docs/PI II.sql`](docs/PI%20II.sql) contém um modelo anterior do banco e **não deve ser usado** para preparar o ambiente desta versão. Os scripts não são migrações: não os execute novamente sobre tabelas já existentes. Para testar, cadastre usuários pela aplicação e crie os projetos e demandas pela interface, ou peça à equipe responsável pelo banco os dados de teste.

## Executar localmente

1. Clone o repositório e acesse a pasta:

   ```bash
   git clone https://github.com/MEIOSSI/PI-II-TIME-N1.git
   cd PI-II-TIME-N1
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie, na raiz do projeto, um arquivo `.env` a partir do `.env.example`. Preencha com os dados fornecidos pelo administrador do Oracle:

   ```dotenv
   PORT=3000
   NODE_ENV=development
   ORACLE_USER=seu_usuario
   ORACLE_PASSWORD=sua_senha
   ORACLE_CONNECT_STRING=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=ENDERECO_DO_BANCO)(PORT=1521))(CONNECT_DATA=(SID=XE)))
   ```

   Ajuste `HOST`, `PORT` e `SID` conforme os dados da instância (o serviço pode fornecer um connect string diferente). Não envie o `.env` ao GitHub: ele contém segredos e está ignorado pelo Git.

4. Inicie a aplicação:

   ```bash
   npm start
   ```

   Esse comando compila o TypeScript e inicia/reinicia o servidor durante o desenvolvimento. A aplicação abre a porta definida em `PORT` somente depois de estabelecer conexão com o Oracle.

5. Acesse [http://localhost:3000](http://localhost:3000) (ou a porta configurada). Use o cadastro para criar uma conta e, após entrar, cadastre ou consulte projetos e demandas. Para testar recursos restritos, como administração, use uma conta com perfil e dados preparados adequadamente no banco.

## Implantar em um ambiente de testes

Em um servidor de testes com Node.js/npm e acesso de rede ao Oracle:

1. Obtenha o código pelo GitHub (`git clone` ou checkout do commit/branch que será avaliado).
2. Na raiz do repositório, instale as dependências de produção com `npm ci --omit=dev` **não é suficiente**, pois a compilação TypeScript e o comando `start` dependem de ferramentas de desenvolvimento. Use `npm ci` para instalar todas as dependências.
3. Prepare o schema Oracle conforme a seção anterior e configure `PORT`, `ORACLE_USER`, `ORACLE_PASSWORD` e `ORACLE_CONNECT_STRING` no ambiente do processo. Em hospedagem, configure esses valores no gerenciador de segredos/variáveis do serviço, sem versionar o `.env`.
4. Compile o servidor:

   ```bash
   npx tsc
   ```

5. Inicie o processo no diretório do projeto:

   ```bash
   node ./lib/app.js
   ```

   Libere a porta configurada no servidor e acesse `http://<endereco-do-servidor>:<PORT>`. Mantenha o processo ativo com o gerenciador disponível no ambiente de testes. O servidor também serve os arquivos estáticos de `public/`; não é necessário hospedá-los separadamente.

Se a inicialização falhar, confira primeiro as variáveis de conexão, se o Oracle está acessível a partir do servidor e se as tabelas foram criadas no schema associado ao usuário. As mensagens de conexão são exibidas no log do processo.

## Estrutura principal

```text
src/                       Código TypeScript do servidor
  Database/                 Conexão Oracle e scripts de criação do schema
  Functions/                Validações e utilitários
  Routes/                   Rotas da aplicação
public/                     Páginas, estilos, scripts e arquivos estáticos
docs/                       Documentação e modelo antigo de banco
lib/                        JavaScript gerado pela compilação do TypeScript
```

## Testes automatizados

Este repositório ainda não possui suíte automatizada configurada. O script `npm test` é apenas um placeholder e retorna erro; portanto, a validação disponível no momento é manual, executando a aplicação com um Oracle preparado e exercitando o fluxo pela interface.

## Repositório

[MEIOSSI/PI-II-TIME-N1 no GitHub](https://github.com/MEIOSSI/PI-II-TIME-N1)
