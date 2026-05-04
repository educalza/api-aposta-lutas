const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { demonstrarCripto } = require('../middlewares/cryptoMiddleware');

// ============================================================
//  POST /apostas/demo-cripto  (rota DIDÁTICA — sem proteção JWT)
//  Demonstra como a criptografia RSA funciona na prática
//  Body: { "mensagem": "texto qualquer" }
// ============================================================
router.post('/demo-cripto', demonstrarCripto);

// POST:
router.post('/', async (req, res) => {

    const { valor, id_luta, id_lutador, id_apostador } = req.body;

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

        // Retorna o objeto criado
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
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ erro: 'O id_luta, id_lutador ou id_apostador fornecido não existe no banco de dados.' });
        }
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});




// GET
router.get('/', async (req, res) => {
    
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



// PUT
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { valor, id_luta, id_lutador, id_apostador } = req.body;

    if (!valor || !id_luta || !id_lutador || !id_apostador) {
        return res.status(400).json({ erro: 'Os campos valor, id_luta, id_lutador e id_apostador são obrigatórios.' });
    }

    if (valor <= 0) {
        return res.status(400).json({ erro: 'O valor da aposta deve ser maior que zero.' });
    }

    try {
        const query = `
            UPDATE apostas 
            SET valor = ?, id_luta = ?, id_lutador = ?, id_apostador = ? 
            WHERE id = ?
        `;
        
        const [result] = await db.execute(query, [valor, id_luta, id_lutador, id_apostador, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Aposta não encontrada.' });
        }

        res.status(200).json({
            mensagem: 'Aposta atualizada com sucesso!',
            aposta: {
                id: parseInt(id),
                valor,
                id_luta,
                id_lutador,
                id_apostador
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar aposta:', error);
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ erro: 'O id_luta, id_lutador ou id_apostador fornecido não existe no banco de dados.' });
        }
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});



// DELETE
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM apostas WHERE id = ?';
        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Aposta não encontrada.' });
        }

        res.status(200).json({ mensagem: 'Aposta removida com sucesso!' });

    } catch (error) {
        console.error('Erro ao deletar aposta:', error);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

module.exports = router;

