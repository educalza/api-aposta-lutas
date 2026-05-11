/**
 * ============================================================
 *  MIDDLEWARE DE AUTENTICAÇÃO JWT (RS256)
 * ============================================================
 *
 *  O que este arquivo faz:
 *    - Intercepta toda requisição às rotas protegidas
 *    - Lê o token JWT do header "Authorization"
 *    - Verifica a assinatura usando a CHAVE PÚBLICA RSA
 *    - Se válido: deixa passar e disponibiliza os dados do usuário
 *    - Se inválido/ausente: bloqueia com erro 401
 *
 *  Como o cliente deve enviar o token:
 *    Header: Authorization: Bearer eyJhbGci...
 *
 *  Por que usamos a CHAVE PÚBLICA aqui?
 *    Na criptografia assimétrica:
 *      - Quem CRIA a assinatura usa a chave PRIVADA (o servidor ao fazer login)
 *      - Quem VERIFICA a assinatura usa a chave PÚBLICA (este middleware)
 *    Isso garante que SOMENTE nosso servidor poderia ter criado esse token.
 * ============================================================
 */

const jwt  = require('jsonwebtoken');
const fs   = require('fs');
const path = require('path');

// Carrega a chave PÚBLICA — usada apenas para VERIFICAR a assinatura
// No Vercel, a chave vem de uma variável de ambiente (já que keys/ está no .gitignore)
// Localmente, lê do arquivo
let PUBLIC_KEY;
if (process.env.JWT_PUBLIC_KEY) {
    PUBLIC_KEY = process.env.JWT_PUBLIC_KEY.split('\\n').join('\n');
} else {
    PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '..', 'keys', 'public.pem'), 'utf8');
}

/**
 * Middleware que protege as rotas
 *
 * @param {object} req - Requisição HTTP (Express)
 * @param {object} res - Resposta HTTP (Express)
 * @param {function} next - Função para avançar ao próximo middleware/rota
 */
function verificarToken(req, res, next) {

    // 1. Pega o header "Authorization" da requisição
    //    Formato esperado: "Bearer eyJhbGci0..."
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({
            erro: 'Token não fornecido.',
            dica: 'Envie o header: Authorization: Bearer <seu_token>'
        });
    }

    // 2. Separa o prefixo "Bearer" do token em si
    //    authHeader.split(' ') → ["Bearer", "eyJhbGci..."]
    const partes = authHeader.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({
            erro: 'Formato do token inválido.',
            dica: 'Use o formato: Bearer <seu_token>'
        });
    }

    const token = partes[1];

    // 3. Verifica o token usando a CHAVE PÚBLICA e o algoritmo RS256
    //
    //    jwt.verify() faz internamente:
    //      a) Decodifica o header e o payload (são apenas Base64)
    //      b) Recalcula o hash SHA-256 de (header + payload)
    //      c) Decifra a assinatura com a chave pública RSA
    //      d) Compara: se os hashes batem → token é autêntico ✅
    //      e) Verifica se o token não está expirado (campo "exp")
    //
    jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }, (erro, payload) => {

        if (erro) {
            // Token inválido, expirado ou adulterado
            if (erro.name === 'TokenExpiredError') {
                return res.status(401).json({ erro: 'Token expirado. Faça login novamente.' });
            }
            return res.status(401).json({ erro: 'Token inválido.', detalhe: erro.message });
        }

        // 4. Token válido! Disponibiliza os dados do usuário para a rota
        //    (id, nome, etc. que foram colocados no payload na hora do login)
        req.usuario = payload;

        // 5. Passa para o próximo middleware ou rota
        next();
    });
}

module.exports = verificarToken;
