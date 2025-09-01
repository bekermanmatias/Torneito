const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Subir imagen
router.post('/image', upload.single('image'), uploadController.uploadImage);

// Subir banner de torneo
router.post('/banner', upload.single('banner'), uploadController.uploadBanner);

// Endpoint de prueba para verificar configuración
router.get('/test-config', (req, res) => {
  res.json({
    message: '🔧 Configuración de Cloudinary',
    config: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ No configurado',
      api_key: process.env.CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ No configurado',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ No configurado'
    }
  });
});

// Eliminar imagen
router.delete('/image/:public_id', uploadController.deleteImage);

module.exports = router;
