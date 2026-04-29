
const express = require('express');
const app = express();
const apostasRoutes = require('./routes/apostas');

app.use(express.json());

// rota
app.use('/apostas', apostasRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});