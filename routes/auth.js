/**
 * ============================================================
 *  ROTA DE AUTENTICAÇÃO — /auth
 * ============================================================
 *
 *  Rotas disponíveis:
 *
 *    POST /auth/registrar  → Cria um novo usuário (senha armazenada com hash)
 *    POST /auth/login      → Autentica e retorna um JWT assinado com RSA-2048
 *
 *  O que é bcrypt?
 *    - Uma função de hash especialmente projetada para senhas
 *    - Adiciona um "salt" aleatório antes de calcular o hash
 *    - É propositalmente lenta (fator de custo = 10 rounds)
 *    - Mesmo que o banco vaze, as senhas reais ficam protegidas
 *    - NUNCA armazenamos a senha em texto claro no banco
 *
 *  O que é JWT?
 *    - JSON Web Token — um padrão aberto (RFC 7519)
 *    - Permite transmitir informações de forma segura e verificável
 *    - Composto por: Header.Payload.Signature (separados por ponto)
 *    - Com RS256, a Signature é criada com RSA-2048 + SHA-256
 *
 *  Fluxo completo:
 *    1. Usuário se registra → senha vira hash bcrypt no banco
 *    2. Usuário faz login  → servidor verifica hash e gera JWT
 *    3. Usuário usa o JWT  → servidor verifica com chave pública
 * ============================================================
 */

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const fs      = require('fs');
const path    = require('path');
const db      = require('../db');

// Carrega a chave PRIVADA — usada para ASSINAR o JWT
// No Vercel: variável de ambiente | Localmente: arquivo .pem
let PRIVATE_KEY;
if (process.env.JWT_PRIVATE_KEY) {
    PRIVATE_KEY = process.env.JWT_PRIVATE_KEY.split('\\n').join('\n');
} else {
    PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '..', 'keys', 'private.pem'), 'utf8');
}

// Tempo de expiração do token (1 hora)
// Após esse tempo, o usuário precisa fazer login novamente
const EXPIRACAO_TOKEN = '1h';


// ============================================================
//  POST /auth/registrar
//  Cria um novo usuário com a senha protegida por bcrypt
// ============================================================
router.post('/registrar', async (req, res) => {
    try {
        const { usuario, senha } = req.body || {};

        if (!usuario || !senha) {
            return res.status(400).json({ erro: 'Campos "usuario" e "senha" são obrigatórios.' });
        }

        if (senha.length < 6) {
            return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
        }

        // Verifica se o usuário já existe
        const [existente] = await db.execute(
            'SELECT id FROM usuarios WHERE usuario = ?',
            [usuario]
        );

        if (existente.length > 0) {
            return res.status(409).json({ erro: 'Nome de usuário já está em uso.' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const [resultado] = await db.execute(
            'INSERT INTO usuarios (usuario, senha_hash) VALUES (?, ?)',
            [usuario, senhaHash]
        );

        res.status(201).json({
            mensagem: 'Usuário registrado com sucesso!',
            usuario: {
                id:      resultado.insertId,
                usuario: usuario
            }
        });

    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor.',
            detalhe: error.message,
            tipo: error.code || error.name
        });
    }
});


// ============================================================
//  POST /auth/login
//  Autentica o usuário e retorna um JWT assinado com RSA-2048
// ============================================================
router.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ erro: 'Campos "usuario" e "senha" são obrigatórios.' });
    }

    try {
        // Busca o usuário no banco
        const [rows] = await db.execute(
            'SELECT id, usuario, senha_hash FROM usuarios WHERE usuario = ?',
            [usuario]
        );

        if (rows.length === 0) {
            // Mensagem genérica — não revelamos se o usuário existe ou não
            return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
        }

        const usuarioEncontrado = rows[0];

        // ─── VERIFICAÇÃO DA SENHA ────────────────────────────────────────────
        //
        //  bcrypt.compare() recalcula o hash da senha enviada (usando o mesmo
        //  salt embutido no hash armazenado) e compara com o hash do banco.
        //  Retorna true se batem, false caso contrário.
        //
        const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha_hash);

        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
        }

        // ─── GERAÇÃO DO JWT COM RS256 ────────────────────────────────────────
        //
        //  jwt.sign(payload, chavePrivada, opções):
        //
        //  O que acontece internamente:
        //    1. Cria o Header:  { "alg": "RS256", "typ": "JWT" } → Base64
        //    2. Cria o Payload: { id, usuario, iat, exp }        → Base64
        //    3. Junta: Base64(header) + "." + Base64(payload)
        //    4. Calcula o SHA-256 desse texto
        //    5. Cifra o hash com a chave PRIVADA RSA-2048
        //    6. Resultado é a Signature → Base64
        //    7. Token final: Header.Payload.Signature
        //
        //  O token NÃO é criptografado (payload é legível em Base64)
        //  mas é ASSINADO — qualquer alteração invalida a assinatura.
        //
        const payload = {
            id:      usuarioEncontrado.id,
            usuario: usuarioEncontrado.usuario
        };

        const token = jwt.sign(payload, PRIVATE_KEY, {
            algorithm:  'RS256',          // RSA-2048 com SHA-256
            expiresIn:  EXPIRACAO_TOKEN   // token expira em 1 hora
        });

        res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            token:    token,
            tipo:     'Bearer',
            expira_em: EXPIRACAO_TOKEN,
            instrucao: 'Use o token no header: Authorization: Bearer <token>',
            algoritmo: {
                jwt:       'RS256',
                rsa_bits:  2048,
                hash:      'SHA-256'
            }
        });

    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

module.exports = router;
