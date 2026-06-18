const mysql = require('mysql2');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'biblioteca', 
    port: '3306' 
});

db.connect(err =>{
    if(err) throw err;
    console.log('conectado ao banco de dados');
    
});

//exportar o módulo de conexão
module.exports = db;