const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./config/database');
const { Usuario, Equipo, Torneo, TorneoEquipo, Partido } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API de Torneito funcionando correctamente!',
    version: '1.0.0',
    endpoints: {
      usuarios: '/api/usuarios',
      equipos: '/api/equipos',
      torneos: '/api/torneos',
      partidos: '/api/partidos'
    }
  });
});

// Ruta de health check para Docker
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas de la API
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/equipos', require('./routes/equipos'));
app.use('/api/torneos', require('./routes/torneos'));
app.use('/api/partidos', require('./routes/partidos'));
app.use('/api/upload', require('./routes/upload'));

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '❌ Error interno del servidor',
    message: err.message
  });
});

// Ruta para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: '❌ Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    // Sincronizar modelos con la base de datos
    await syncDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Base de datos conectada y sincronizada`);
      console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

module.exports = app;
