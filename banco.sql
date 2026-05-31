create database biblioteca;
use biblioteca;

create table usuario (
	id_usuario int not null auto_increment primary key,
    nome varchar(255) not null,
    email varchar(255) not null,
    senha varchar(100) not null,
    perfil enum('bibliotecario', 'leitor')
);

create table livro (
	id_livro int not null auto_increment primary key,
    titulo varchar(255) not null,
    autor varchar(255) not null,
    ano_publicacao int,
    quantidade_disponivel int not null
);

create table emprestimo (
	id_emprestimo int not null auto_increment primary key,
    livro_id int,
    usuario_id int,
    data_emprestimo DATE not null,
    data_devolucao_prevista DATE not null,
    data_devolucao_real DATE,
    status_emprestimo ENUM('ativo', 'devolvido', 'atrasado') not null,
    foreign key (livro_id) references livro(id_livro),
    foreign key (usuario_id) references usuario(id_usuario)
);