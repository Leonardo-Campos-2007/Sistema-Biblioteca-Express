const express = require('express'); // const router = express.Router();

const router = express.Router(); // 

const db = rquire('../db'); // Conecta ao banco de dados

// ------------------------ GET ----------------------------------------------------------------------------------------------------------

// Rota para cadastro de usuário
router.get('/cadastroUser', (req, res) => {
    const { nome, email, senha, perfil } = req.body;
    db.query('insert into usuario (nome, email, senha, perfil) values (? , ? , ?, ?', [nome, email, senha, perfil],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' })
            }
            res.status(201).json({
                message: 'Usuario cadastrado com sucesso', id: result.insertId, nome, email, perfil
            });
        });
});

// Cadastrar livros
router.get('/cadastroLivro', (req, res) => {
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;
    db.query('insert into livro (titulo, autor, ano_publicacao, quantidade_disponivel) values (?, ?, ?, ?', [titulo, autor, ano_publicacao, quantidade_disponivel],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' })
            }
            res.status(201).json({
                message: 'Livro cadastrrado com sucesso', id: result.insertId, titulo, autor, ano_publicacao, quantidade_disponivel
            });
        });

});

// Criar emprestimo
router.get('/emprestimo', (req, res) => {
    const { livro_id, usuario_id, data_empretimo, data_devolucao_prevista, data_devolucao_real, status_emeprestimo } = req.body;
    db.query('insert into emprestimo (livro_id, usuario_id, data_emprestimo, dat_devolucao_prevista, data_devolucao_real, status_emprestimo) values (? , ?, ?, ?, ?, ?) ', [livro_id, usuario_id, data_empretimo, data_devolucao_prevista, data_devolucao_real, status_emeprestimo],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' })

            }
            res.status(201).json({
                message: 'Emprestomo feito com sucesso', id: result.insertId, livro_id, usuario_id, data_empretimo, data_devolucao_prevista, data_devolucao_real, status_emeprestimo
            });
        });
});

// ------------------------------------------------- PUT ----------------------------------------------------------------------------------------

// editar usuario
router.put('/:id_usuario', (req, res) => {
    const {id_usuario} = req.params;
    const {nome, email, senha, perfil} = req.body;

    db.query('update usuario set nome = ?, email = ?, senha = ?, perfil = ? where id_usuario = ?', [nome, email, senha, perfil], (err, result) => {
        if(err){
            return res.status(500).json({message: 'Erro interno do servidor'});
        }
        if(result.affectedRows === 0){
            res.status(404).json({message: 'Usuario não encontrado'});
        }
        res.status(200).json({id:Number(id_usuario), nome, email, perfil});
    });
});