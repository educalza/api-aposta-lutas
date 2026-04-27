const express = require('express');
const router = express.Router();
const db = require('../db'); // Arquivo de conexão com o banco

// POST: Criar uma nova aposta
router.post('/', async (req, res) => {
    // Pegando exatamente os campos definidos pelo grupo
    const { valor, id_luta, id_lutador, id_apostador } = req.body;

    // Validação para garantir que nada veio vazio
    if (!valor || !id_luta || !id_lutador || !id_apostador) {
        return res.status(400).json({ erro: 'Os campos valor, id_luta, id_lutador e id_apostador são obrigatórios.' });
    }

    if (valor <= 0) {
        return res.status(400).json({ erro: 'O valor da aposta deve ser maior que zero.' });
    }

    try {
        const query = `
            INSERT INTO apostas (valor, id_luta, id_lutador, id_apostador) 
            VALUES (?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [valor, id_luta, id_lutador, id_apostador]);

        // Retorna o objeto criado, incluindo o ID gerado pelo banco
        res.status(201).json({
            mensagem: 'Aposta registrada com sucesso!',
            aposta: {
                id: result.insertId,
                valor,
                id_luta,
                id_lutador,
                id_apostador
            }
        });

    } catch (error) {
        console.error('Erro ao registrar aposta:', error);
        
        // Verifica se o erro foi causado por IDs que não existem nas outras tabelas
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ erro: 'O id_luta, id_lutador ou id_apostador fornecido não existe no banco de dados.' });
        }
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

// GET: Listar todas as apostas
router.get('/', async (req, res) => {
    // Filtrar apostas por apostador (ex: /apostas?id_apostador=1)
    const { id_apostador } = req.query; 

    try {
        let query = 'SELECT id, valor, id_luta, id_lutador, id_apostador FROM apostas';
        const params = [];

        if (id_apostador) {
            query += ' WHERE id_apostador = ?';
            params.push(id_apostador);
        }

        const [rows] = await db.execute(query, params);
        res.status(200).json(rows);

    } catch (error) {
        console.error('Erro ao buscar apostas:', error);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

module.exports = router;
