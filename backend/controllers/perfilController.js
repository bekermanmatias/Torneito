const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

// Obtener perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    
    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: { exclude: ['password'] } // No enviar la contraseña
    });

    if (!usuario) {
      return res.status(404).json({
        error: '❌ Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    res.json({
      message: '✅ Perfil obtenido exitosamente',
      usuario
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
    const usuarioId = req.usuario.id;
    const { nombre, email, passwordActual, passwordNuevo } = req.body;

    // Buscar el usuario
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        error: '❌ Usuario no encontrado',
        message: 'El usuario especificado no existe'
      });
    }

    // Validar que al menos un campo se proporcione
    if (!nombre && !email && !passwordNuevo) {
      return res.status(400).json({
        error: '❌ Campos requeridos',
        message: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    // Si se va a cambiar la contraseña, validar la actual
    if (passwordNuevo) {
      if (!passwordActual) {
        return res.status(400).json({
          error: '❌ Contraseña actual requerida',
          message: 'Debe proporcionar su contraseña actual para cambiarla'
        });
      }

      const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
      if (!passwordValida) {
        return res.status(400).json({
          error: '❌ Contraseña incorrecta',
          message: 'La contraseña actual es incorrecta'
        });
      }

      // Validar nueva contraseña
      if (passwordNuevo.length < 6) {
        return res.status(400).json({
          error: '❌ Contraseña muy corta',
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }
    }

    // Si se va a cambiar el email, verificar que no exista
    if (email && email !== usuario.email) {
      const emailExistente = await Usuario.findOne({
        where: { email }
      });

      if (emailExistente) {
        return res.status(409).json({
          error: '❌ Email ya existe',
          message: 'Ya existe una cuenta con ese email'
        });
      }
    }

    // Preparar datos para actualizar
    const datosActualizar = {};
    if (nombre) datosActualizar.nombre = nombre;
    if (email) datosActualizar.email = email;
    if (passwordNuevo) {
      const salt = await bcrypt.genSalt(10);
      datosActualizar.password = await bcrypt.hash(passwordNuevo, salt);
    }

    // Actualizar usuario
    await usuario.update(datosActualizar);

    // Obtener usuario actualizado sin contraseña
    const usuarioActualizado = await Usuario.findByPk(usuarioId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: '✅ Perfil actualizado exitosamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al actualizar el perfil'
    });
  }
};

// Obtener estadísticas del usuario
const obtenerEstadisticas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    
    // Contar torneos
    const { Torneo } = require('../models');
    const totalTorneos = await Torneo.count({
      where: { usuarioId }
    });

    const torneosFinalizados = await Torneo.count({
      where: { 
        usuarioId,
        estado: 'finalizado'
      }
    });

    const torneosEnCurso = await Torneo.count({
      where: { 
        usuarioId,
        estado: 'en_curso'
      }
    });

    // Contar equipos
    const { Equipo } = require('../models');
    const totalEquipos = await Equipo.count({
      where: { usuarioId }
    });

    res.json({
      message: '✅ Estadísticas obtenidas exitosamente',
      estadisticas: {
        totalTorneos,
        torneosFinalizados,
        torneosEnCurso,
        torneosPendientes: totalTorneos - torneosFinalizados - torneosEnCurso,
        totalEquipos
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al obtener las estadísticas'
    });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  obtenerEstadisticas
};
