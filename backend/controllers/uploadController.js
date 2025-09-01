const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Función para convertir buffer a stream
const bufferToStream = (buffer) => {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return readable;
};

// Subir imagen a Cloudinary
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: '❌ No se proporcionó archivo',
        message: 'Por favor selecciona una imagen'
      });
    }

    // Crear stream desde el buffer
    const stream = bufferToStream(req.file.buffer);

    // Subir a Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.pipe(uploadStream);
    });

    const result = await uploadPromise;

    res.json({
      message: '✅ Imagen subida exitosamente',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al subir la imagen'
    });
  }
};

// Subir banner de torneo a Cloudinary
const uploadBanner = async (req, res) => {
  try {
    console.log('🔍 Iniciando upload de banner...');
    console.log('🔍 Variables de entorno Cloudinary:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ No configurado',
      api_key: process.env.CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ No configurado',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ No configurado'
    });

    if (!req.file) {
      return res.status(400).json({
        error: '❌ No se proporcionó archivo',
        message: 'Por favor selecciona una imagen'
      });
    }

    console.log('📁 Archivo recibido:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Crear stream desde el buffer
    const stream = bufferToStream(req.file.buffer);

    // Subir a Cloudinary con configuración simplificada
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.pipe(uploadStream);
    });

    const result = await uploadPromise;

    console.log('✅ Banner subido exitosamente:', {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    });

    res.json({
      message: '✅ Banner subido exitosamente',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    console.error('❌ Error al subir banner:', error);
    console.error('❌ Detalles del error:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name
    });
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al subir el banner'
    });
  }
};

// Eliminar imagen de Cloudinary
const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.params;

    if (!public_id) {
      return res.status(400).json({
        error: '❌ ID de imagen requerido',
        message: 'Se requiere el ID público de la imagen'
      });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    res.json({
      message: '✅ Imagen eliminada exitosamente',
      data: result
    });

  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al eliminar la imagen'
    });
  }
};

module.exports = {
  uploadImage,
  uploadBanner,
  deleteImage
};
