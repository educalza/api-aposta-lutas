// conexão com o banco de dados MySQL
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '15516871943Edç',
    database: 'api_apostas'
});

module.exports = pool;
