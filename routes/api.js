const express = require('express');
const router = express.Router();
const db = require('../db');

// ------------------------ ADICIONAR ------------------------------------------

router.post('/cadastroUser', (req, res) => {
    const { nome, email, senha, perfil } = req.body;
    db.query('INSERT INTO usuario (nome, email, senha, perfil) VALUES (?, ?, ?, ?)', [nome, email, senha, perfil],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            res.status(201).json({
                message: 'Usuario cadastrado com sucesso', id: result.insertId, nome, email, perfil
            });
        });
});

router.post('/cadastroLivro', (req, res) => {
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;
    db.query('INSERT INTO livro (titulo, autor, ano_publicacao, quantidade_disponivel) VALUES (?, ?, ?, ?)', [titulo, autor, ano_publicacao, quantidade_disponivel],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            res.status(201).json({
                message: 'Livro cadastrado com sucesso', id: result.insertId, titulo, autor, ano_publicacao, quantidade_disponivel
            });
        });
});

router.post('/emprestimo', (req, res) => {
    const { livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, data_devolucao_real, status_emprestimo } = req.body;
    db.query('INSERT INTO emprestimo (livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, data_devolucao_real, status_emprestimo) VALUES (?, ?, ?, ?, ?, ?)', [livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, data_devolucao_real, status_emprestimo],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            res.status(201).json({
                message: 'Emprestimo feito com sucesso', id: result.insertId, livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, data_devolucao_real, status_emprestimo
            });
        });
});

// ------------------------------------------------- EDITAR --------------------

router.put('/usuario/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const { nome, email, senha, perfil } = req.body;

    db.query('UPDATE usuario SET nome = ?, email = ?, senha = ?, perfil = ? WHERE id_usuario = ?', [nome, email, senha, perfil, id_usuario], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario não encontrado' });
        }
        res.status(200).json({ id_usuario: Number(id_usuario), nome, email, perfil });
    });
});

router.put('/livro/:id_livro', (req, res) => {
    const { id_livro } = req.params;
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

    db.query('UPDATE livro SET titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ? WHERE id_livro = ?', [titulo, autor, ano_publicacao, quantidade_disponivel, id_livro], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        res.status(200).json({ id_livro: Number(id_livro), titulo, autor, ano_publicacao, quantidade_disponivel });
    });
});

router.put('/emprestimo/:id_emprestimo', (req, res) => {
    const { id_emprestimo } = req.params;
    const { livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, data_devolucao_real, status_emprestimo } = req.body;

    db.query('UPDATE emprestimo SET livro_id = ?, usuario_id = ?, data_emprestimo = ?, data_devolucao_prevista = ?, data_devolucao_real = ?, status_emprestimo = ? WHERE id_emprestimo = ?', [livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, data_devolucao_real, status_emprestimo, id_emprestimo], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Emprestimo não encontrado' });
        }
        res.status(200).json({ id_emprestimo: Number(id_emprestimo), livro_id, usuario_id, data_emprestimo, data_devolucao_prevista, data_devolucao_real, status_emprestimo });
    });
});

// ----------------------------------------------------------- LISTAR ----------

router.get('/listarUsuarios', (req, res) => {
    db.query('SELECT * FROM usuario', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.status(200).json(results);
    });
});

router.get('/listarLivros', (req, res) => {
    db.query('SELECT * FROM livro', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.status(200).json(results);
    });
});

router.get('/listarEmprestimos', (req, res) => {
    db.query('SELECT * FROM emprestimo', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        res.status(200).json(results);
    });
});

// ------------------------------------------------------DELETAR---------------

router.delete('/usuario/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    db.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            res.sendStatus(204);
        });
});

router.delete('/livro/:id_livro', (req, res) => {
    const { id_livro } = req.params;
    db.query('DELETE FROM livro WHERE id_livro = ?', [id_livro],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            res.sendStatus(204);
        });
});

router.delete('/emprestimo/:id_emprestimo', (req, res) => {
    const { id_emprestimo } = req.params;
    db.query('DELETE FROM emprestimo WHERE id_emprestimo = ?', [id_emprestimo],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            res.sendStatus(204);
        });
});

module.exports = router;