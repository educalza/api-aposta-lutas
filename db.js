// conexão com o banco de dados MySQL
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '15516871943Edç',
    database: process.env.DB_NAME     || 'api_apostas',
    port:     process.env.DB_PORT     || 3306
});

module.exports = pool;
