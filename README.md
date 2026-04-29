# API Aposta Luta

Uma API RESTful desenvolvida em Node.js com Express para gerenciar um sistema de apostas em lutas, sendo parte das atividades de Sistemas Distribuídos.

## Pré-requisitos

- **Node.js** (v14 ou superior recomendado)
- **MySQL** rodando localmente (ou em um servidor acessível)

## Configuração do Banco de Dados

1. Certifique-se de que o MySQL está rodando na sua máquina.
2. Crie um banco de dados chamado `api_apostas`.
3. Crie a tabela `apostas` e demais tabelas necessárias. Se houver um arquivo `schema.sql` no projeto, execute-o em seu banco de dados.
4. O arquivo de configuração do banco de dados é o `db.js`. Caso a senha ou o usuário do seu MySQL local sejam diferentes, edite esse arquivo de acordo com as suas credenciais:
   ```javascript
   const pool = mysql.createPool({
       host: 'localhost',
       user: 'root', // Seu usuário do MySQL
       password: 'sua_senha_aqui', // Sua senha do MySQL
       database: 'api_apostas'
   });
   ```

## Instalação e Execução

1. Abra o terminal na pasta raiz do projeto.
2. Instale as dependências (Express e MySQL2):
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   node app.js
   ```
   *Observação: se você estiver usando `nodemon` ou tiver o script configurado no `package.json`, também pode usar `npm start` ou `npm run dev`.*
4. O servidor indicará no console que está rodando na porta `3000` (`http://localhost:3000`).

---

## Documentação da API (Endpoints)

A URL base para os endpoints de apostas é: `http://localhost:3000/apostas`

### 1. Criar Aposta (`POST /apostas`)
Registra uma nova aposta no banco de dados.

- **Corpo da requisição (JSON):**
  ```json
  {
    "valor": 150.50,
    "id_luta": 1,
    "id_lutador": 2,
    "id_apostador": 5
  }
  ```
- **Retornos:**
  - `201 Created`: Aposta registrada com sucesso.
  - `400 Bad Request`: Faltando campos obrigatórios, valor da aposta inválido ou IDs de chave estrangeira não encontrados.

### 2. Listar Apostas (`GET /apostas`)
Retorna uma lista das apostas registradas. Pode ser filtrada por apostador.

- **Exemplos de requisição:**
  - `GET /apostas` (lista todas as apostas)
  - `GET /apostas?id_apostador=5` (lista apenas as apostas do usuário de ID 5)
- **Retorno:**
  - `200 OK`: Array de objetos JSON contendo as apostas.

### 3. Atualizar Aposta (`PUT /apostas/:id`)
Substitui os dados de uma aposta já existente pelo ID informado na URL.

- **Corpo da requisição (JSON):**
  ```json
  {
    "valor": 200.00,
    "id_luta": 1,
    "id_lutador": 2,
    "id_apostador": 5
  }
  ```
- **Retornos:**
  - `200 OK`: Aposta atualizada com sucesso.
  - `404 Not Found`: Aposta não encontrada com o ID informado.
  - `400 Bad Request`: Dados incorretos.

### 4. Remover Aposta (`DELETE /apostas/:id`)
Remove o registro de uma aposta no banco de dados com base no ID informado na URL.

- **Exemplo de requisição:** `DELETE /apostas/10`
- **Retornos:**
  - `200 OK`: Aposta removida com sucesso.
  - `404 Not Found`: Aposta não encontrada com o ID informado.

---

## Testando a API
Você pode usar ferramentas como **Postman**, **Insomnia** ou **cURL** para enviar requisições à API. Certifique-se de configurar o Header das requisições POST e PUT com `Content-Type: application/json`.
