const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas CRUD básicas
router.get('/', equipoController.obtenerEquipos);
router.post('/', equipoController.crearEquipo);

// Rutas especiales (deben ir antes que /:id)
router.get('/search', equipoController.buscarEquipos);

// Rutas CRUD con ID
router.get('/:id', equipoController.obtenerEquipo);
router.put('/:id', equipoController.actualizarEquipo);
router.delete('/:id', equipoController.eliminarEquipo);

module.exports = router;
