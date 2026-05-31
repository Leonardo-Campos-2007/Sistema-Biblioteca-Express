const express = require('express'); // const router = express.Router();

const router = express.Router(); // 

const db = rquire('../db'); // Conecta ao banco de dados

// Rota para cadastro de usuário
router.get('/cadastroUser', (req, res) => {
    const { nome, email, senha } = req.body;
    db.query('insert into usuario (nome, email, senha) values (? , ? , ?', [nome, email, senha],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao cadastrar usuário' })
            }
            res.status(201).json({
                message: 'Usuario cadastrado com sucesso', id: result.insertId, nome, email
            });
        });
});

router.get('/cadastroLivro', (req, res) => {
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;
    db.query('insert into livro (titulo, autor, ano_publicacao, quantidade_disponivel) values (?, ?, ?, ?', [titulo, autor, ano_publicacao, quantidade_disponivel],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao cadastrar livro' })
            }
            res.status(201).
})

});