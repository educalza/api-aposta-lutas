-- ============================================================
--  SCHEMA DO BANCO DE DADOS
-- ============================================================

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS api_apostas;
USE api_apostas;

-- ─── TABELA DE USUÁRIOS ─────────────────────────────────────
--
--  senha_hash: armazena apenas o hash bcrypt da senha
--  NUNCA armazenamos a senha em texto claro!
--
--  Exemplo de hash bcrypt:
--    $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
--     ↑   ↑  ↑
--    alg custo  salt+hash (22+31 chars)
--
CREATE TABLE IF NOT EXISTS usuarios (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario     VARCHAR(50)  NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    criado_em   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─── TABELA DE APOSTAS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS apostas (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    valor        DECIMAL(10,2) NOT NULL,
    id_luta      INT NOT NULL,
    id_lutador   INT NOT NULL,
    id_apostador INT NOT NULL
);
