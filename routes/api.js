const express = require('express'); // const router = express.Router();

const router = express.Router(); // 

const db = rquire('../db'); // Conecta ao banco de dados

// ------------------------ ADICIONAR ----------------------------------------------------------------------------------------------------------

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

// ------------------------------------------------- EDITAR ----------------------------------------------------------------------------------------

// editar usuario
router.put('/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const { nome, email, senha, perfil } = req.body;

    db.query('update usuario set nome = ?, email = ?, senha = ?, perfil = ? where id_usuario = ?', [nome, email, senha, perfil], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Usuario não encontrado' });
        }
        res.status(200).json({ id_usuario: Number(id_usuario), nome, email, perfil });
    });
});

//Editar livro

router.put('/:id_livro', (req, res) => {
    const { id_livro } = req.params;
    const { titulo, autor, ano_publicacao, quantidade_disponivel } = req.body;

    db.query('update livro set titulo = ?, autor = ?, ano_publicacao = ?, quantidade_disponivel = ? where id_livro = ?', [titulo, autor, ano_publicacao, quantidade_disponivel], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Livro não encontrado' });
        }
        res.status(200).json({ id_livro: Number(id_livro), titulo, autor, ano_publicacao, quantidade_disponivel });
    });
});

// 

router.put('/:id_emprestimo', (req, res) => {
    const { id_emprestimo } = req.params;
    const { livro_id, usuario_id, data_empretimo, data_devolucao_prevista, data_devolucao_real, status_emeprestimo } = req.body;

    db.query('update livro set livro_id = ?, usuario_id = ?, data_emprestimo = ?, data_devolucoa_prevista = ?, data_devolucao_real = ?, status_emprestimo = ? where id_emprestimo', [livro_id, usuario_id, data_empretimo, data_devolucao_prevista, data_devolucao_real, status_emeprestimo], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Livro não encontrado' });
        }
        res.status(200).json({ id_emprestimo: Number(id_emprestimo), livro_id, usuario_id, data_empretimo, data_devolucao_prevista, data_devolucao_real, status_emeprestimo });
    });
});

// ----------------------------------------------------------- LISTAR -------------------------------------------------------------------------

router.get('/listarUsuarios', (req, res) => {
    db.query('select * from usuario', (err, results) => {
        if(err){
            return res.status(500).json({message: 'Erro interno do servidor'});
        }
        res.status(200).json(results)
    })
});

router.get('/listarLivros', (req, res) => {
    db.query('select * from livro', (err, results) => {
        if(err){
            return res.status(500).json({message: 'Erro interno do servidor'})
        }
        res.status(200).json(results)
    });
});

router.get('/listarEmprestimos', (req, res) => {
    db.query('select * from emprestimo', (err, results) => {
        if(err){
            return res.status(500).json({message: 'Erro interno do servidor'})
        }
        res.status(200).json(results)
    })
})