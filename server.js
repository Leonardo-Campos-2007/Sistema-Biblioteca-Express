const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

// 1. MIDDLEWARES CONFIGURAÇÃO (Sempre no topo)
app.use(express.json()); // Ativa a leitura de JSON do corpo das requisições (req.body)
app.use(express.static(path.join(__dirname, 'public')));

const db = require('./db');

// 2. ROTAS DE PÁGINAS ESTÁTICAS
app.get('/', (req, res) => {
    // Corrigido um pequeno erro de digitação do seu código original (tinha 3 underscores: ___dirname)
    res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

// 3. ROTAS DA API (Alterado de '/routes' para '/' para bater com seus scripts JS)
const apiRouter = require('./routes/api');
app.use('/', apiRouter); 

// 4. INICIALIZAÇÃO DO SERVIDOR
app.listen(port, () => {
    console.log(`Server funcionando em http://localhost:${port}`);
});


