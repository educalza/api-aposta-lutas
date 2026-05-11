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

const express = require('express');
const app     = express();

app.use(express.json());

// ─── ROTA DE DIAGNÓSTICO (raiz) ──────────────────────────────
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        mensagem: 'API de Apostas de Lutas está rodando!',
        rotas: {
            publicas: ['POST /auth/registrar', 'POST /auth/login'],
            protegidas: ['GET /apostas', 'POST /apostas', 'PUT /apostas/:id', 'DELETE /apostas/:id'],
            demo: ['POST /apostas/demo-cripto']
        }
    });
});

// ─── CARREGAMENTO SEGURO DOS MÓDULOS ─────────────────────────
try {
    const authRoutes     = require('./routes/auth');
    const apostasRoutes  = require('./routes/apostas');
    const verificarToken = require('./middlewares/authMiddleware');

    // ROTAS PÚBLICAS (sem autenticação)
    app.use('/auth', authRoutes);

    // ROTAS PROTEGIDAS (exigem JWT válido)
    app.use('/apostas', verificarToken, apostasRoutes);
} catch (error) {
    console.error('❌ Erro ao carregar módulos:', error.message);

    // Se os módulos falharem, pelo menos a rota raiz funciona
    // e mostra o erro para diagnóstico
    app.use('/auth', (req, res) => {
        res.status(500).json({ erro: 'Falha ao carregar módulo auth', detalhe: error.message });
    });
    app.use('/apostas', (req, res) => {
        res.status(500).json({ erro: 'Falha ao carregar módulo apostas', detalhe: error.message });
    });
}

// ─── SERVIDOR LOCAL (só roda fora do Vercel) ─────────────────
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
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
}

// ─── EXPORT PARA O VERCEL (Serverless Function) ──────────────
module.exports = app;