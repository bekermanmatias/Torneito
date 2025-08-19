const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken } = require('../middleware/auth');

// Rutas públicas (sin autenticación)
router.post('/register', usuarioController.registrarUsuario);
router.post('/login', usuarioController.loginUsuario);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, usuarioController.obtenerPerfil);
router.put('/profile', authenticateToken, usuarioController.actualizarPerfil);
router.put('/password', authenticateToken, usuarioController.cambiarPassword);

module.exports = router;
