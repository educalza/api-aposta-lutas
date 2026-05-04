/**
 * ============================================================
 *  GERADOR DE CHAVES RSA-2048
 * ============================================================
 *
 *  Execute este script UMA ÚNICA VEZ para criar o par de chaves:
 *    node generate-keys.js
 *
 *  O que este script faz:
 *    - Usa o módulo "crypto" que já vem com o Node.js (sem instalar nada)
 *    - Gera duas chaves matematicamente ligadas:
 *        🔑 Chave PRIVADA → fica no servidor, usada para ASSINAR o JWT
 *        🔓 Chave PÚBLICA  → usada para VERIFICAR se o JWT é autêntico
 *
 *  Por que RSA-2048?
 *    - RSA usa a dificuldade de fatorar números primos gigantes
 *    - 2048 bits = chave com ~617 dígitos decimais
 *    - É o padrão mínimo recomendado para ambientes de produção
 *
 *  Formato PEM (Privacy Enhanced Mail):
 *    - É simplesmente o texto da chave codificado em Base64
 *    - Tem os marcadores -----BEGIN ... KEY----- e -----END ... KEY-----
 * ============================================================
 */

const crypto = require('crypto');  // módulo nativo do Node.js
const fs     = require('fs');      // módulo nativo para escrever arquivos
const path   = require('path');

// Pasta onde as chaves serão salvas
const keysDir = path.join(__dirname, 'keys');

// Cria a pasta /keys se não existir
if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir);
    console.log('📁 Pasta "keys/" criada.');
}

console.log('⏳ Gerando par de chaves RSA-2048...\n');

// ============================================================
//  GERAÇÃO DO PAR DE CHAVES
// ============================================================
//
//  generateKeyPairSync(tipo, opções) → gera as chaves de forma síncrona
//
//  Opções usadas:
//    modulusLength : tamanho da chave em bits (2048 é o padrão recomendado)
//    publicKeyEncoding  : formato de exportação da chave pública
//    privateKeyEncoding : formato de exportação da chave privada
//
//  Formato PKCS#8 para privada e SPKI para pública são padrões que o
//  módulo "jsonwebtoken" entende nativamente.
// ============================================================
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,

    publicKeyEncoding: {
        type:   'spki',    // SubjectPublicKeyInfo — padrão X.509
        format: 'pem'      // Base64 com cabeçalho legível
    },

    privateKeyEncoding: {
        type:   'pkcs8',   // PKCS#8 — padrão moderno para chaves privadas
        format: 'pem'      // Base64 com cabeçalho legível
    }
});

// Salva as chaves em arquivos .pem
const privatePath = path.join(keysDir, 'private.pem');
const publicPath  = path.join(keysDir, 'public.pem');

fs.writeFileSync(privatePath, privateKey);
fs.writeFileSync(publicPath,  publicKey);

console.log('✅ Chaves geradas com sucesso!\n');
console.log('   🔑 Chave PRIVADA → keys/private.pem');
console.log('      (NUNCA compartilhe ou suba para o Git!)\n');
console.log('   🔓 Chave PÚBLICA  → keys/public.pem');
console.log('      (Pode ser distribuída livremente)\n');

// Mostra um preview das chaves geradas
console.log('--- Preview da Chave Pública ---');
console.log(publicKey);
console.log('--- Preview da Chave Privada (primeiras linhas) ---');
console.log(privateKey.split('\n').slice(0, 4).join('\n') + '\n...');
