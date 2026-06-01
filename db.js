const mysql = require('mysql2');

//parametros de configuração do banco (credenciais)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'biblioteca', 
    port: '3306' 
});

//estabelecer a conexão
db.connect(err =>{
    if(err) throw err;
    console.log('conectado ao banco de dados');
    
});

//exportar o módulo de conexão
module.exports = db;