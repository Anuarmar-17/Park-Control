const express = require('express');
const router = express.Router();
const {
  getTarifas, createTarifa, updateTarifa, deleteTarifa,
  getUsuarios, createUsuario, updateUsuario, deleteUsuario
} = require('../controllers/adminController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Proteger todas las rutas, solo para administrador.
// Si tu middleware verificarRol(['admin']) existe, úsalo. Por ahora usamos verificarToken.
router.use(verificarToken);

// Tarifas
router.get('/tarifas', getTarifas);
router.post('/tarifas', createTarifa);
router.put('/tarifas/:id', updateTarifa);
router.delete('/tarifas/:id', deleteTarifa);

// Usuarios
router.get('/usuarios', getUsuarios);
router.post('/usuarios', createUsuario);
router.put('/usuarios/:id', updateUsuario);
router.delete('/usuarios/:id', deleteUsuario);

module.exports = router;
