/**
 * ============================================================
 *  PONTO DE ENTRADA DA API — app.js
 * ============================================================
 *
 *  Estrutura de segurança:
 *
 *    /auth/registrar  →  Público (cria conta)
 *    /auth/login      →  Público (gera o token JWT)
 *    /apostas/**      →  🔒 Protegido (exige token JWT válido)
 *
 *  O middleware "verificarToken" é aplicado ANTES das rotas de apostas.
 *  Qualquer requisição sem um token RS256 válido recebe erro 401.
 * ============================================================
 */

const express       = require('express');
const app           = express();
const apostasRoutes = require('./routes/apostas');
const authRoutes    = require('./routes/auth');
const verificarToken = require('./middlewares/authMiddleware');

app.use(express.json());

// ─── ROTAS PÚBLICAS (sem autenticação) ───────────────────────
//  /auth/registrar → cria usuário
//  /auth/login     → gera token JWT
app.use('/auth', authRoutes);

// ─── ROTAS PROTEGIDAS (exigem JWT válido) ────────────────────
//  verificarToken é executado ANTES de qualquer rota de /apostas
//  Se o token for inválido, a requisição para aqui (erro 401)
app.use('/apostas', verificarToken, apostasRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
    console.log(`\n📋 Rotas disponíveis:`);
    console.log(`   POST /auth/registrar    → criar conta (público)`);
    console.log(`   POST /auth/login        → fazer login e obter token (público)`);
    console.log(`   POST /apostas/demo-cripto → demo RSA (público)`);
    console.log(`\n   🔒 Rotas protegidas (exigem: Authorization: Bearer <token>)`);
    console.log(`   GET    /apostas         → listar apostas`);
    console.log(`   POST   /apostas         → criar aposta`);
    console.log(`   PUT    /apostas/:id     → editar aposta`);
    console.log(`   DELETE /apostas/:id     → remover aposta\n`);
});