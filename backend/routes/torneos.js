const express = require('express');
const router = express.Router();
const torneoController = require('../controllers/torneoController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas CRUD básicas
router.get('/', torneoController.obtenerTorneos);
router.post('/', torneoController.crearTorneo);

// Rutas especiales (deben ir antes que /:id)
router.get('/:id/tabla-posiciones', torneoController.obtenerTablaPosiciones);

// Rutas CRUD con ID
router.get('/:id', torneoController.obtenerTorneo);
router.put('/:id', torneoController.actualizarTorneo);
router.delete('/:id', torneoController.eliminarTorneo);

module.exports = router;
