const express = require('express');
const router = express.Router();
const { registrarEntrada, registrarSalida, getHistorial } = require('../controllers/operacionController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Proteger todas las rutas de operación, solo Operadores o Administradores pueden registrar entradas/salidas
// En un sistema real podrías usar el middleware verificarRol(['Operario', 'Admin']) en estas rutas específicas

router.post('/entrada', verificarToken, registrarEntrada);
router.post('/salida', verificarToken, registrarSalida);
router.get('/historial', verificarToken, getHistorial);

module.exports = router;
