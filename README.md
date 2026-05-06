# 🥊 API Aposta Luta

API RESTful desenvolvida em **Node.js** com **Express** para gerenciar um sistema de apostas em lutas, com autenticação JWT assinada por **RSA-2048** e demonstração de criptografia assimétrica. Projeto desenvolvido como parte das atividades da disciplina de **Sistemas Distribuídos**.

---

## 📋 Tecnologias Utilizadas

| Tecnologia | Versão | Função |
|---|---|---|
| **Node.js** | v14+ | Runtime JavaScript |
| **Express** | 5.x | Framework HTTP |
| **MySQL2** | 3.x | Driver de banco de dados |
| **jsonwebtoken** | 9.x | Geração e verificação de tokens JWT (RS256) |
| **bcryptjs** | 3.x | Hash seguro de senhas |
| **crypto** (nativo) | — | Geração de chaves RSA e cifragem/decifragem |

---

## 🏗️ Estrutura do Projeto

```
api-aposta-luta/
├── app.js                        # Ponto de entrada — configura rotas e middlewares
├── db.js                         # Conexão com o banco de dados MySQL
├── generate-keys.js              # Script para gerar o par de chaves RSA-2048
├── schema.sql                    # Script SQL para criar as tabelas
├── package.json                  # Dependências do projeto
├── postman_collection.json       # Coleção pronta para importar no Postman
├── keys/                         # Chaves RSA (geradas pelo generate-keys.js)
│   ├── private.pem               # 🔑 Chave privada (NUNCA compartilhar!)
│   └── public.pem                # 🔓 Chave pública
├── middlewares/
│   ├── authMiddleware.js         # Middleware de verificação do token JWT (RS256)
│   └── cryptoMiddleware.js       # Middleware de demonstração de cifragem RSA
└── routes/
    ├── auth.js                   # Rotas de registro e login
    └── apostas.js                # Rotas CRUD de apostas + demo criptografia
```

---

## 🔐 Segurança — Como Funciona

### Autenticação JWT com RSA-2048 (RS256)

A API utiliza **criptografia assimétrica** para autenticação, diferente do padrão simétrico (HS256) que usa uma senha secreta compartilhada.

```
┌─────────────┐     POST /auth/login      ┌──────────────┐
│   Cliente    │ ──────────────────────── │   Servidor    │
│  (Postman)   │                          │  (Node.js)    │
│              │  ◄─── Token JWT ──────── │               │
│              │       assinado com       │  🔑 Chave     │
│              │       CHAVE PRIVADA      │    Privada     │
│              │                          │               │
│              │  ── Token JWT ─────────► │               │
│              │     no header            │  🔓 Chave     │
│              │     Authorization        │    Pública     │
│              │                          │  (verifica)    │
└─────────────┘                          └──────────────┘
```

**Fluxo:**
1. O usuário faz **login** → o servidor **assina** o JWT com a **chave privada**
2. O usuário envia o JWT nas requisições → o servidor **verifica** com a **chave pública**
3. Se a assinatura é válida e o token não expirou → a requisição é autorizada

### Hash de Senhas com bcrypt

As senhas **nunca** são armazenadas em texto claro. O bcrypt:
- Gera um **salt aleatório** para cada senha
- Aplica **2^10 = 1.024 iterações** de hash
- Armazena salt + hash juntos no campo `senha_hash`

### Criptografia RSA (Demonstração Didática)

A rota `/apostas/demo-cripto` demonstra **cifragem e decifragem RSA** — diferente do JWT que apenas **assina**:

| Conceito | JWT (Auth) | Cifragem RSA (Demo) |
|---|---|---|
| Objetivo | Garantir **autenticidade** | Garantir **confidencialidade** |
| Chave privada | **Assina** o token | **Decifra** a mensagem |
| Chave pública | **Verifica** o token | **Cifra** a mensagem |
| Conteúdo visível? | Sim (Base64) | Não (cifrado) |

---

## ⚙️ Pré-requisitos

- **Node.js** v14 ou superior
- **MySQL** rodando localmente (ou em um servidor acessível)

---

## 🚀 Instalação e Execução

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd api-aposta-luta
npm install
```

### 2. Configurar o banco de dados

1. Crie o banco de dados `api_apostas` no MySQL.
2. Execute o arquivo `schema.sql` para criar as tabelas:
   ```sql
   SOURCE schema.sql;
   ```
3. Se necessário, edite as credenciais do MySQL no arquivo `db.js`:
   ```javascript
   const pool = mysql.createPool({
       host: 'localhost',
       user: 'root',
       password: 'sua_senha_aqui',
       database: 'api_apostas'
   });
   ```

### 3. Gerar as chaves RSA

Execute **uma única vez** antes de iniciar o servidor:

```bash
node generate-keys.js
```

Isso cria a pasta `keys/` com os arquivos `private.pem` e `public.pem`.

> ⚠️ **Nunca compartilhe a chave privada nem suba ela para o Git!**

### 4. Iniciar o servidor

```bash
npm start
```

O servidor rodará em `http://localhost:3000`.

---

## 📖 Documentação da API (Endpoints)

### Rotas Públicas (sem autenticação)

#### `POST /auth/registrar` — Criar conta

Registra um novo usuário. A senha é armazenada como hash bcrypt.

**Body (JSON):**
```json
{
    "usuario": "eduardo",
    "senha": "minhasenha123"
}
```

**Respostas:**
| Código | Descrição |
|---|---|
| `201` | Usuário registrado com sucesso |
| `400` | Campos obrigatórios ausentes ou senha < 6 caracteres |
| `409` | Nome de usuário já está em uso |

---

#### `POST /auth/login` — Fazer login e obter token JWT

Autentica o usuário e retorna um token JWT assinado com RS256, válido por **1 hora**.

**Body (JSON):**
```json
{
    "usuario": "eduardo",
    "senha": "minhasenha123"
}
```

**Resposta de sucesso (200):**
```json
{
    "mensagem": "Login realizado com sucesso!",
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tipo": "Bearer",
    "expira_em": "1h",
    "instrucao": "Use o token no header: Authorization: Bearer <token>",
    "algoritmo": {
        "jwt": "RS256",
        "rsa_bits": 2048,
        "hash": "SHA-256"
    }
}
```

> 📌 **Copie o valor do campo `token`** — ele será usado em todas as rotas protegidas.

**Respostas de erro:**
| Código | Descrição |
|---|---|
| `400` | Campos obrigatórios ausentes |
| `401` | Usuário ou senha inválidos |

---

#### `POST /apostas/demo-cripto` — Demonstração de criptografia RSA

Rota didática que mostra o processo completo de **cifragem** (com chave pública) e **decifragem** (com chave privada) usando RSA-2048.

**Body (JSON):**
```json
{
    "mensagem": "Texto secreto para demonstrar RSA!"
}
```

**Resposta de sucesso (200):**
```json
{
    "explicacao": "Demonstração de cifragem RSA assimétrica",
    "algoritmo": {
        "nome": "RSA-2048",
        "padding": "OAEP com SHA-256",
        "chave_bits": 2048
    },
    "passo_1_original": {
        "mensagem": "Texto secreto para demonstrar RSA!",
        "bytes_utf8": 34
    },
    "passo_2_cifrado": {
        "descricao": "Cifrado com a CHAVE PÚBLICA — ninguém lê sem a chave privada",
        "conteudo": "base64_do_texto_cifrado...",
        "bytes": 256
    },
    "passo_3_decifrado": {
        "descricao": "Decifrado com a CHAVE PRIVADA — somente o servidor consegue",
        "mensagem": "Texto secreto para demonstrar RSA!"
    },
    "conclusao": "✅ Cifragem e decifragem funcionaram corretamente!"
}
```

---

### 🔒 Rotas Protegidas (exigem token JWT)

Todas as rotas abaixo exigem o header de autenticação:

```
Authorization: Bearer <token_obtido_no_login>
```

**Respostas comuns de autenticação:**
| Código | Descrição |
|---|---|
| `401` | Token não fornecido, inválido, formato incorreto ou expirado |

---

#### `POST /apostas` — Criar aposta

**Body (JSON):**
```json
{
    "valor": 150.50,
    "id_luta": 1,
    "id_lutador": 2,
    "id_apostador": 1
}
```

**Respostas:**
| Código | Descrição |
|---|---|
| `201` | Aposta registrada com sucesso |
| `400` | Campos obrigatórios ausentes, valor ≤ 0 ou IDs inexistentes |

---

#### `GET /apostas` — Listar apostas

Retorna todas as apostas. Aceita filtro opcional por apostador.

**Exemplos:**
- `GET /apostas` — lista todas
- `GET /apostas?id_apostador=1` — filtra por apostador

**Resposta (200):**
```json
[
    {
        "id": 1,
        "valor": "150.50",
        "id_luta": 1,
        "id_lutador": 2,
        "id_apostador": 1
    }
]
```

---

#### `PUT /apostas/:id` — Atualizar aposta

**Exemplo:** `PUT /apostas/1`

**Body (JSON):**
```json
{
    "valor": 200.00,
    "id_luta": 1,
    "id_lutador": 3,
    "id_apostador": 1
}
```

**Respostas:**
| Código | Descrição |
|---|---|
| `200` | Aposta atualizada com sucesso |
| `404` | Aposta não encontrada |
| `400` | Dados incorretos |

---

#### `DELETE /apostas/:id` — Remover aposta

**Exemplo:** `DELETE /apostas/1`

Sem body na requisição.

**Respostas:**
| Código | Descrição |
|---|---|
| `200` | Aposta removida com sucesso |
| `404` | Aposta não encontrada |

---

## 🧪 Testando a API (Passo a Passo)

Use o **Postman**, **Insomnia** ou **cURL**. O projeto inclui um arquivo `postman_collection.json` que pode ser importado diretamente no Postman.

### Fluxo completo de teste:

**1. Registrar um usuário**
```
POST http://localhost:3000/auth/registrar
Content-Type: application/json

{ "usuario": "eduardo", "senha": "minhasenha123" }
```

**2. Fazer login e copiar o token**
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{ "usuario": "eduardo", "senha": "minhasenha123" }
```

**3. Criar uma aposta (usando o token)**
```
POST http://localhost:3000/apostas
Content-Type: application/json
Authorization: Bearer <cole_o_token_aqui>

{ "valor": 150.50, "id_luta": 1, "id_lutador": 2, "id_apostador": 1 }
```

**4. Listar apostas**
```
GET http://localhost:3000/apostas
Authorization: Bearer <cole_o_token_aqui>
```

**5. Testar a demo de criptografia RSA**
```
POST http://localhost:3000/apostas/demo-cripto
Content-Type: application/json

{ "mensagem": "Olá, esta mensagem será cifrada com RSA!" }
```

---

## 📚 Conceitos de Segurança Demonstrados

| Conceito | Implementação | Arquivo |
|---|---|---|
| **Hash de senhas** | bcrypt com salt e 10 rounds | `routes/auth.js` |
| **Autenticação por token** | JWT assinado com RS256 | `routes/auth.js` |
| **Verificação de token** | Middleware com chave pública | `middlewares/authMiddleware.js` |
| **Cifragem assimétrica** | RSA-2048 com OAEP + SHA-256 | `middlewares/cryptoMiddleware.js` |
| **Geração de chaves** | Par RSA-2048 (PKCS#8 / SPKI) | `generate-keys.js` |
