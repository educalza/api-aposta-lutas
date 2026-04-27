-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS api_apostas;
USE api_apostas;

-- Tabela de apostas (sem Foreign Keys para evitar erros caso as outras tabelas não existam)
CREATE TABLE IF NOT EXISTS apostas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    valor DECIMAL(10,2) NOT NULL,
    id_luta INT NOT NULL,
    id_lutador INT NOT NULL,
    id_apostador INT NOT NULL
);
