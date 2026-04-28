const express = require('express');
const router = express.Router();
const { getDisponibilidad, getVehiculosEnCurso, getMetricasAdmin, getReportesMensuales } = require('../controllers/dashboardController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Rutas accesibles por operario y admin
router.get('/disponibilidad', verificarToken, getDisponibilidad);
router.get('/en-curso', verificarToken, getVehiculosEnCurso);

// Rutas accesibles solo por admin
router.get('/metricas', verificarToken, getMetricasAdmin);
router.get('/reportes-mensuales', verificarToken, getReportesMensuales);

module.exports = router;
