// app.js
const express = require('express');
const app = express();
const apostasRoutes = require('./routes/apostas');

app.use(express.json()); // Importante para ler o req.body em JSON

// Define o prefixo da rota
app.use('/apostas', apostasRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});