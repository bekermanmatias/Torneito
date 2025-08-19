const { Usuario } = require('../models');
const { generateToken } = require('../middleware/auth');

// Registrar nuevo usuario
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: '❌ Campos requeridos',
        message: 'Nombre, email y contraseña son obligatorios'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: '❌ Email inválido',
        message: 'El formato del email no es válido'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: '❌ Contraseña muy corta',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({
        error: '❌ Email ya registrado',
        message: 'Ya existe un usuario con este email'
      });
    }

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      passwordHash: password // Se encripta automáticamente en el modelo
    });

    // Generar token JWT
    const token = generateToken(nuevoUsuario);

    res.status(201).json({
      message: '✅ Usuario registrado exitosamente',
      usuario: nuevoUsuario.toJSON(),
      token
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al registrar el usuario'
    });
  }
};

// Iniciar sesión
const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        error: '❌ Campos requeridos',
        message: 'Email y contraseña son obligatorios'
      });
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        error: '❌ Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.comparePassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        error: '❌ Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar token JWT
    const token = generateToken(usuario);

    res.json({
      message: '✅ Inicio de sesión exitoso',
      usuario: usuario.toJSON(),
      token
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al iniciar sesión'
    });
  }
};

// Obtener perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = req.usuario;
    
    res.json({
      message: '✅ Perfil obtenido exitosamente',
      usuario: usuario.toJSON()
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al obtener el perfil'
    });
  }
};

// Actualizar perfil del usuario
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email } = req.body;
    const usuario = req.usuario;

    // Validar que al menos un campo se proporcione
    if (!nombre && !email) {
      return res.status(400).json({
        error: '❌ Campos requeridos',
        message: 'Debe proporcionar al menos nombre o email'
      });
    }

    // Si se va a actualizar el email, verificar que no exista
    if (email && email !== usuario.email) {
      const emailExistente = await Usuario.findOne({ where: { email } });
      if (emailExistente) {
        return res.status(409).json({
          error: '❌ Email ya registrado',
          message: 'Ya existe un usuario con este email'
        });
      }
    }

    // Actualizar usuario
    const datosActualizar = {};
    if (nombre) datosActualizar.nombre = nombre;
    if (email) datosActualizar.email = email;

    await usuario.update(datosActualizar);

    res.json({
      message: '✅ Perfil actualizado exitosamente',
      usuario: usuario.toJSON()
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al actualizar el perfil'
    });
  }
};

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const usuario = req.usuario;

    // Validar campos requeridos
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        error: '❌ Campos requeridos',
        message: 'Contraseña actual y nueva contraseña son obligatorios'
      });
    }

    // Validar longitud de nueva contraseña
    if (passwordNueva.length < 6) {
      return res.status(400).json({
        error: '❌ Contraseña muy corta',
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar contraseña actual
    const passwordValida = await usuario.comparePassword(passwordActual);
    if (!passwordValida) {
      return res.status(401).json({
        error: '❌ Contraseña actual incorrecta',
        message: 'La contraseña actual no es correcta'
      });
    }

    // Actualizar contraseña
    await usuario.update({ passwordHash: passwordNueva });

    res.json({
      message: '✅ Contraseña cambiada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al cambiar la contraseña'
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword
};
