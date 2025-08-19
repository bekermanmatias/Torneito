const { Equipo } = require('../models');

// Obtener todos los equipos del usuario autenticado
const obtenerEquipos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    
    const equipos = await Equipo.findAll({
      where: { usuarioId },
      order: [['nombre', 'ASC']]
    });

    res.json({
      message: '✅ Equipos obtenidos exitosamente',
      equipos,
      total: equipos.length
    });
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al obtener los equipos'
    });
  }
};

// Obtener un equipo específico
const obtenerEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const equipo = await Equipo.findOne({
      where: { id, usuarioId }
    });

    if (!equipo) {
      return res.status(404).json({
        error: '❌ Equipo no encontrado',
        message: 'El equipo especificado no existe o no pertenece al usuario'
      });
    }

    res.json({
      message: '✅ Equipo obtenido exitosamente',
      equipo
    });
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al obtener el equipo'
    });
  }
};

// Crear nuevo equipo
const crearEquipo = async (req, res) => {
  try {
    const { nombre, escudo_url } = req.body;
    const usuarioId = req.usuario.id;

    // Validar campos requeridos
    if (!nombre) {
      return res.status(400).json({
        error: '❌ Campo requerido',
        message: 'El nombre del equipo es obligatorio'
      });
    }

    // Validar longitud del nombre
    if (nombre.length < 2 || nombre.length > 100) {
      return res.status(400).json({
        error: '❌ Nombre inválido',
        message: 'El nombre debe tener entre 2 y 100 caracteres'
      });
    }

    // Verificar si ya existe un equipo con ese nombre para el usuario
    const equipoExistente = await Equipo.findOne({
      where: { nombre, usuarioId }
    });

    if (equipoExistente) {
      return res.status(409).json({
        error: '❌ Equipo ya existe',
        message: 'Ya tienes un equipo con ese nombre'
      });
    }

    // Crear el equipo
    const nuevoEquipo = await Equipo.create({
      nombre,
      escudo_url,
      usuarioId
    });

    res.status(201).json({
      message: '✅ Equipo creado exitosamente',
      equipo: nuevoEquipo
    });
  } catch (error) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al crear el equipo'
    });
  }
};

// Actualizar equipo
const actualizarEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, escudo_url } = req.body;
    const usuarioId = req.usuario.id;

    // Buscar el equipo
    const equipo = await Equipo.findOne({
      where: { id, usuarioId }
    });

    if (!equipo) {
      return res.status(404).json({
        error: '❌ Equipo no encontrado',
        message: 'El equipo especificado no existe o no pertenece al usuario'
      });
    }

    // Validar que al menos un campo se proporcione
    if (!nombre && escudo_url === undefined) {
      return res.status(400).json({
        error: '❌ Campos requeridos',
        message: 'Debe proporcionar al menos nombre o escudo_url'
      });
    }

    // Si se va a actualizar el nombre, verificar que no exista
    if (nombre && nombre !== equipo.nombre) {
      const nombreExistente = await Equipo.findOne({
        where: { nombre, usuarioId }
      });

      if (nombreExistente) {
        return res.status(409).json({
          error: '❌ Nombre ya existe',
          message: 'Ya tienes un equipo con ese nombre'
        });
      }
    }

    // Actualizar equipo
    const datosActualizar = {};
    if (nombre) datosActualizar.nombre = nombre;
    if (escudo_url !== undefined) datosActualizar.escudo_url = escudo_url;

    await equipo.update(datosActualizar);

    res.json({
      message: '✅ Equipo actualizado exitosamente',
      equipo
    });
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al actualizar el equipo'
    });
  }
};

// Eliminar equipo
const eliminarEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Buscar el equipo
    const equipo = await Equipo.findOne({
      where: { id, usuarioId }
    });

    if (!equipo) {
      return res.status(404).json({
        error: '❌ Equipo no encontrado',
        message: 'El equipo especificado no existe o no pertenece al usuario'
      });
    }

    // Verificar si el equipo está siendo usado en algún torneo
    const equiposEnTorneos = await equipo.countTorneos();
    if (equiposEnTorneos > 0) {
      return res.status(400).json({
        error: '❌ No se puede eliminar',
        message: 'No se puede eliminar un equipo que está participando en torneos'
      });
    }

    // Eliminar el equipo
    await equipo.destroy();

    res.json({
      message: '✅ Equipo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al eliminar el equipo'
    });
  }
};

// Buscar equipos por nombre
const buscarEquipos = async (req, res) => {
  try {
    const { q } = req.query;
    const usuarioId = req.usuario.id;

    if (!q) {
      return res.status(400).json({
        error: '❌ Parámetro requerido',
        message: 'El parámetro de búsqueda "q" es obligatorio'
      });
    }

    const equipos = await Equipo.findAll({
      where: {
        usuarioId,
        nombre: {
          [require('sequelize').Op.iLike]: `%${q}%`
        }
      },
      order: [['nombre', 'ASC']]
    });

    res.json({
      message: '✅ Búsqueda completada',
      equipos,
      total: equipos.length,
      query: q
    });
  } catch (error) {
    console.error('Error al buscar equipos:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al buscar equipos'
    });
  }
};

module.exports = {
  obtenerEquipos,
  obtenerEquipo,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
  buscarEquipos
};
