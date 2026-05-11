/**
 * ============================================================
 *  MIDDLEWARE DE DEMONSTRAÇÃO DE CRIPTOGRAFIA RSA
 * ============================================================
 *
 *  Este arquivo é DIDÁTICO — mostra como o RSA funciona na prática.
 *
 *  Diferença entre o que este arquivo faz e o JWT:
 *
 *    JWT (authMiddleware.js):
 *      → Usa RSA para ASSINAR e VERIFICAR (garante autenticidade)
 *      → A chave privada ASSINA, a pública VERIFICA
 *      → O conteúdo do token é visível (apenas Base64), não cifrado
 *
 *    Cifragem direta (este arquivo):
 *      → Usa RSA para CIFRAR e DECIFRAR (garante confidencialidade)
 *      → A chave PÚBLICA cifra, a chave PRIVADA decifra
 *      → Apenas quem tem a chave privada consegue ler a mensagem
 *
 *  Como funciona matematicamente (simplificado):
 *    - RSA baseia-se na dificuldade de fatorar números primos gigantes
 *    - Chave pública é (e, n), chave privada é (d, n)
 *    - Cifrar:  C = M^e mod n
 *    - Decifrar: M = C^d mod n
 *    - Com 2048 bits, "n" tem ~617 dígitos — impossível de fatorar hoje
 *
 *  Rota de demonstração:
 *    POST /apostas/demo-cripto
 *    Body: { "mensagem": "qualquer texto aqui" }
 *
 *  A rota vai:
 *    1. Receber a mensagem em texto claro
 *    2. Cifrar com a chave pública RSA
 *    3. Decifrar com a chave privada RSA
 *    4. Retornar todo o processo para visualização
 * ============================================================
 */

const crypto = require('crypto'); // módulo nativo do Node.js
const fs     = require('fs');
const path   = require('path');

// Carrega as duas chaves (env var no Vercel, arquivo local)
const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY
    ? process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n')
    : fs.readFileSync(path.join(__dirname, '..', 'keys', 'public.pem'), 'utf8');
const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY
    ? process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n')
    : fs.readFileSync(path.join(__dirname, '..', 'keys', 'private.pem'), 'utf8');

/**
 * Demonstra cifragem e decifragem RSA em uma única rota
 */
function demonstrarCripto(req, res) {
    const { mensagem } = req.body;

    if (!mensagem) {
        return res.status(400).json({ erro: 'Envie o campo "mensagem" no body.' });
    }

    // ─── PASSO 1: CIFRAR com a chave PÚBLICA ─────────────────────────────────
    //
    //  publicEncrypt() usa o padrão OAEP (Optimal Asymmetric Encryption Padding)
    //  com SHA-256 — que é o padrão seguro atual para RSA.
    //
    //  O resultado é um Buffer de bytes aleatórios — sem a chave privada,
    //  é impossível recuperar a mensagem original.
    //
    const mensagemBuffer  = Buffer.from(mensagem, 'utf8');
    const mensagemCifrada = crypto.publicEncrypt(
        {
            key:     PUBLIC_KEY,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        mensagemBuffer
    );

    // Converte para Base64 para exibir de forma legível
    const cifradaBase64 = mensagemCifrada.toString('base64');

    // ─── PASSO 2: DECIFRAR com a chave PRIVADA ───────────────────────────────
    //
    //  Somente a chave privada correspondente consegue reverter a operação.
    //  privateDecrypt() realiza a operação matemática inversa da cifragem.
    //
    const mensagemDecifrada = crypto.privateDecrypt(
        {
            key:     PRIVATE_KEY,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        mensagemCifrada
    );

    // ─── RESPOSTA: mostra todo o processo ────────────────────────────────────
    res.status(200).json({
        explicacao: 'Demonstração de cifragem RSA assimétrica',

        algoritmo: {
            nome:        'RSA-2048',
            padding:     'OAEP com SHA-256',
            chave_bits:  2048,
            modulo_bits: 2048
        },

        passo_1_original: {
            mensagem:    mensagem,
            bytes_utf8:  mensagemBuffer.length
        },

        passo_2_cifrado: {
            descricao:   'Cifrado com a CHAVE PÚBLICA — ninguém lê sem a chave privada',
            conteudo:    cifradaBase64,
            bytes:       mensagemCifrada.length
        },

        passo_3_decifrado: {
            descricao:  'Decifrado com a CHAVE PRIVADA — somente o servidor consegue',
            mensagem:   mensagemDecifrada.toString('utf8')
        },

        conclusao: mensagem === mensagemDecifrada.toString('utf8')
            ? '✅ Cifragem e decifragem funcionaram corretamente!'
            : '❌ Algo deu errado.'
    });
}

module.exports = { demonstrarCripto };
