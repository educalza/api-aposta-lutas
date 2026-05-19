# API Aposta Lutas

API RESTful para gerenciamento de apostas em lutas, com autenticação JWT assimétrica (RSA-2048).

**URL de Produção:** `https://api-aposta-lutas.vercel.app`

> Não é necessário clonar o repositório ou configurar ambiente local para consumir a API — ela já está disponível publicamente via Vercel.

---

## Autenticação

O acesso às rotas protegidas exige um **Token JWT**, obtido após o login.

**Fluxo:**
1. Crie uma conta via `/auth/registrar`
2. Faça login via `/auth/login` e guarde o `token` retornado
3. Inclua o token em todas as requisições protegidas:

```
Authorization: Bearer <SEU_TOKEN>
```

---

## Endpoints

### Públicos (sem autenticação)

#### `POST /auth/registrar` — Criar conta

```json
// Corpo
{ "usuario": "nome", "senha": "senha" }

// Resposta 201 — confirmação do registro
```

---

#### `POST /auth/login` — Fazer login

```json
// Corpo
{ "usuario": "nome", "senha": "senha" }

// Resposta 200
{
    "mensagem": "Login realizado com sucesso!",
    "token": "eyJhbGciOiJSUzI1NiIsInR...",
    "tipo": "Bearer",
    "expira_em": "1h"
}
```

---

#### `POST /apostas/demo-cripto` — Demonstração de criptografia RSA

Endpoint didático que ilustra o ciclo de cifragem e decifragem assimétrica.

```json
// Corpo
{ "mensagem": "Texto simples para processamento" }

// Resposta 200 — retorna o texto original, a versão cifrada (Base64) e a decifragem pelo servidor
```

---

### Protegidos (requerem `Authorization: Bearer <TOKEN>`)

#### `POST /apostas` — Registrar aposta

```json
// Corpo
{ "valor": 150.50, "id_luta": 1, "id_lutador": 2, "id_apostador": 1 }

// Resposta 201 — dados inseridos com o ID gerado pelo banco
```

---

#### `GET /apostas` — Listar apostas

Suporta filtragem por apostador:

```
GET /apostas?id_apostador=1
```

```json
// Resposta 200
[{ "id": 1, "valor": "150.50", "id_luta": 1, "id_lutador": 2, "id_apostador": 1 }]
```

---

#### `PUT /apostas/:id` — Atualizar aposta

Substitua `:id` pelo identificador numérico da aposta. O corpo deve conter todos os campos.

```json
// Corpo
{ "valor": 200.00, "id_luta": 1, "id_lutador": 3, "id_apostador": 1 }

// Resposta 200 — confirmação da atualização
```

---

#### `DELETE /apostas/:id` — Remover aposta

Substitua `:id` pelo identificador da aposta a ser excluída.

```
// Resposta 200 — registro removido permanentemente
```

---

## Testes com Postman

O repositório inclui o arquivo `postman_collection.json`. Para usar:

1. Importe o arquivo no Postman
2. Aponte as requisições para `https://api-aposta-lutas.vercel.app`
3. Após o login, cole o `token` retornado na aba **Authorization** das rotas protegidas

---

## Execução Local (opcional)

Necessário apenas para modificar o código-fonte.

**Pré-requisitos:** Node.js 14+ e MySQL

**Configuração:**
1. Crie o banco de dados `api_apostas` no MySQL
2. Execute o `schema.sql` (raiz do projeto) para criar as tabelas
3. Edite `db.js` com suas credenciais locais do MySQL

**Inicialização:**
```bash
npm install          # Instala dependências
node generate-keys.js  # Gera o par de chaves RSA (apenas na primeira vez)
npm start            # Inicia o servidor em http://localhost:3000
```

---

## Fundamentos Técnicos

### Arquitetura RESTful

Comunicação *stateless* entre cliente e servidor, com roteamento semântico dos métodos HTTP (GET, POST, PUT, DELETE) via **Express.js** sobre **Node.js**. A conexão com o banco **MySQL** usa *Connection Pool*, reutilizando conexões TCP abertas e evitando sobrecarga.

### JWT com Criptografia Assimétrica (RS256) e Algoritmo RSA-2048

Diferente do uso comum de chave simétrica (um único segredo para assinar e validar), esta API utiliza o algoritmo **RSA (Rivest-Shamir-Adleman)** com chaves de 2048 bits, geradas nativamente pelo módulo `crypto` do Node.js. A segurança matemática do RSA apoia-se na inviabilidade computacional de reverter (fatorar) a multiplicação de dois números primos gigantescos.

Neste modelo:
- A **Chave Privada** (formato PKCS#8) é mantida em sigilo no servidor e utilizada para **assinar** o token no momento do login.
- A **Chave Pública** (formato SPKI) pode ser livremente distribuída e é usada nas rotas protegidas para **verificar** a autenticidade do token.

Isso possibilita que outros microserviços validem sessões de forma independente — basta ter a Chave Pública (formato legível PEM/Base64), eliminando a necessidade de consultar o banco de dados centralizado ou compartilhar segredos privados.

### Armazenamento Seguro de Senhas (Bcrypt)

Senhas nunca são armazenadas em texto plano. O algoritmo **bcrypt** aplica:

- **Salt aleatório** por usuário, concatenado antes do hash
- **Work Factor exponencial** (~1024 iterações), tornando ataques de força bruta e *rainbow tables* computacionalmente inviáveis

### Criptografia RSA na Rota de Demonstração

A rota `/apostas/demo-cripto` mostra o ciclo completo de confidencialidade:

- **Cifragem:** texto cifrado com a Chave Pública usando padding OAEP (SHA-256), gerando um bloco ilegível em Base64
- **Decifragem:** apenas o servidor, detentor da Chave Privada, consegue reverter o bloco à mensagem original