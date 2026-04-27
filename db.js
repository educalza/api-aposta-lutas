// db.js - Conexão com o banco de dados MySQL
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',           // Seu usuário do MySQL
    password: '15516871943Edç',            // A senha do seu MySQL (deixe vazio se não tiver senha)
    database: 'api_apostas'  // O nome do banco que você criou
});

module.exports = pool;
