const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Middleware para verificar el token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: '❌ Token de acceso requerido',
        message: 'Debe proporcionar un token de autenticación'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({
        error: '❌ Token inválido',
        message: 'El usuario asociado al token no existe'
      });
    }

    // Agregar el usuario al objeto request
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: '❌ Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: '❌ Token expirado',
        message: 'El token ha expirado, inicie sesión nuevamente'
      });
    }

    console.error('Error en autenticación:', error);
    return res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al verificar la autenticación'
    });
  }
};

// Middleware opcional para rutas que pueden funcionar con o sin autenticación
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const usuario = await Usuario.findByPk(decoded.id);
      if (usuario) {
        req.usuario = usuario;
      }
    }
    
    next();
  } catch (error) {
    // Si hay error en el token, continuamos sin autenticación
    next();
  }
};

// Función para generar token JWT
const generateToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email,
      nombre: usuario.nombre 
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken
};
