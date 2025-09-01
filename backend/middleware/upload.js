const multer = require('multer');
const path = require('path');

// Configurar multer para subida de archivos
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Verificar tipo de archivo
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
});

module.exports = upload;
