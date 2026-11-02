create table usuarios (
    id integer primary KEY,
    nome varchar2(200) not NULL,
    email varchar2(200) not null,
--    cargo varchar2(200) not null,
    senha varchar2(200) not null,

    constraint uq_email unique (email)
);

create table projetos (
    id integer primary key,
    titulo varchar2(200) not null,
    descricao varchar2(200) not null,
    data_criacao DATE default CURRENT_DATE,
    id_usuario integer not null,
    constraint fk_usuario FOREIGN key (id_usuario) references usuarios (id) 
);   

create table membros_projetos (
    id integer primary key,
    data_vinculacao date default current_date,
    id_usuario INTEGER not null,
    id_projeto integer not null,
    constraint uq_usuario_projeto unique (id_usuario, id_projeto),
    CONSTRAINT fk_usuario_membros FOREIGN key (id_usuario) REFERENCES usuarios (id),
    CONSTRAINT fk_projeto_membros FOREIGN key (id_projeto) REFERENCES projetos (id)
);

CREATE TABLE demandas (
    id INTEGER PRIMARY key,
    tipo_demanda VARCHAR2(20) not null check(tipo_demanda in('tarefa', 'defeito', 'melhoria', 'documentacao')),
    prioridade VARCHAR2(10) not null  check(prioridade in ('critica', 'alta', 'media', 'baixa')),
    status VARCHAR2(10) not null check(status in ('aberto', 'andamento', 'revisao', 'concluido', 'cancelado')),
    titulo VARCHAR2(200) not NULL,
    descricao VARCHAR2(200),
    data_criacao date default current_date,
    data_atualizacao date,
    prazo_final date,
    id_projeto integer not null,
    id_usuario INTEGER NOT NULL,
    CONSTRAINT fk_usuario_demandas FOREIGN KEY (id_usuario) references usuarios (id),
    constraint fk_projeto_demandas FOREIGN key (id_projeto) references projetos (id)
);

  create table historicos_demandas (
    id integer primary key,
    status varchar2(200) not NULL,
    prioridade varchar2(200) not NULL,
    data_finalizacao date,
    id_usuario integer not null,
    id_demanda INTEGER not null,
    CONSTRAINT fk_demanda_historico FOREIGN key (id_demanda) references demandas (id),
    constraint fk_usuario_historico FOREIGN key (id_usuario) references usuarios (id)
  );     

  create table comentarios (
    id INTEGER PRIMARY key,
    descricao varchar2(200),
    data_criacao date default current_date,
    id_usuario INTEGER NOT NULL,
    id_demanda INTEGER NOT NULL,
    CONSTRAINT fk_usuario_comentario FOREIGN KEY (id_usuario) REFERENCES usuarios (id),
    CONSTRAINT fk_demanda_comentario FOREIGN KEY (id_demanda) REFERENCES demandas (id)
);



    
-- alter table projetos add constraint fk_usuario FOREIGN key (id_usuario) references usarios (id);

-- insert into PROJETOS (id, titulo, descricao) 
-- values (1, 'teste projeto', 'descrição teste');

-- select * from projetos;

-- drop table usuarios;
-- drop table projetos;