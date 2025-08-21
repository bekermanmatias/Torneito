const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const perfilController = require('../controllers/perfilController');
const { authenticateToken } = require('../middleware/auth');

// Rutas públicas (sin autenticación)
router.post('/register', usuarioController.registrarUsuario);
router.post('/login', usuarioController.loginUsuario);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, perfilController.obtenerPerfil);
router.put('/profile', authenticateToken, perfilController.actualizarPerfil);
router.get('/stats', authenticateToken, perfilController.obtenerEstadisticas);

module.exports = router;
