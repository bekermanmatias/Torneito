const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para partidos de un torneo
router.get('/torneo/:torneoId', partidoController.obtenerPartidosTorneo);

// Rutas para estadísticas (debe ir antes que /:id)
router.get('/torneo/:torneoId/equipo/:equipoId/estadisticas', partidoController.obtenerEstadisticasEquipo);

// Rutas para un partido específico
router.get('/:id', partidoController.obtenerPartido);

// Rutas para gestionar resultados
router.put('/:id/resultado', partidoController.registrarResultado);
router.put('/:id/actualizar-resultado', partidoController.actualizarResultado);
router.delete('/:id/resultado', partidoController.eliminarResultado);

module.exports = router;
