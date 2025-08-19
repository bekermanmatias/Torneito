const { Torneo, Equipo, TorneoEquipo, Partido } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los torneos del usuario autenticado
const obtenerTorneos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    
    const torneos = await Torneo.findAll({
      where: { usuarioId },
      include: [
        {
          model: Equipo,
          as: 'equipos',
          through: { attributes: [] } // No incluir datos de la tabla intermedia
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: '✅ Torneos obtenidos exitosamente',
      torneos,
      total: torneos.length
    });
  } catch (error) {
    console.error('Error al obtener torneos:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al obtener los torneos'
    });
  }
};

// Obtener un torneo específico con detalles
const obtenerTorneo = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const torneo = await Torneo.findOne({
      where: { id, usuarioId },
      include: [
        {
          model: Equipo,
          as: 'equipos',
          through: { attributes: [] }
        },
        {
          model: Partido,
          as: 'partidos',
          include: [
            {
              model: Equipo,
              as: 'equipoLocal',
              attributes: ['id', 'nombre', 'escudo_url']
            },
            {
              model: Equipo,
              as: 'equipoVisitante',
              attributes: ['id', 'nombre', 'escudo_url']
            }
          ],
          order: [['fecha', 'ASC']]
        }
      ]
    });

    if (!torneo) {
      return res.status(404).json({
        error: '❌ Torneo no encontrado',
        message: 'El torneo especificado no existe o no pertenece al usuario'
      });
    }

    res.json({
      message: '✅ Torneo obtenido exitosamente',
      torneo
    });
  } catch (error) {
    console.error('Error al obtener torneo:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al obtener el torneo'
    });
  }
};

// Crear nuevo torneo
const crearTorneo = async (req, res) => {
  try {
    const { nombre, tipo, equiposIds } = req.body;
    const usuarioId = req.usuario.id;

    // Validar campos requeridos
    if (!nombre || !tipo || !equiposIds || !Array.isArray(equiposIds)) {
      return res.status(400).json({
        error: '❌ Campos requeridos',
        message: 'Nombre, tipo y lista de equipos son obligatorios'
      });
    }

    // Validar tipo de torneo
    if (!['liga', 'eliminacion'].includes(tipo)) {
      return res.status(400).json({
        error: '❌ Tipo inválido',
        message: 'El tipo debe ser "liga" o "eliminacion"'
      });
    }

    // Validar número mínimo de equipos
    if (equiposIds.length < 2) {
      return res.status(400).json({
        error: '❌ Equipos insuficientes',
        message: 'Se requieren al menos 2 equipos para crear un torneo'
      });
    }

    // Para eliminación directa, verificar que sea potencia de 2
    if (tipo === 'eliminacion') {
      const esPotenciaDe2 = (equiposIds.length & (equiposIds.length - 1)) === 0;
      if (!esPotenciaDe2) {
        return res.status(400).json({
          error: '❌ Número de equipos inválido',
          message: 'Para eliminación directa, el número de equipos debe ser una potencia de 2 (2, 4, 8, 16, etc.)'
        });
      }
    }

    // Verificar que todos los equipos pertenezcan al usuario
    const equipos = await Equipo.findAll({
      where: {
        id: { [Op.in]: equiposIds },
        usuarioId
      }
    });

    if (equipos.length !== equiposIds.length) {
      return res.status(400).json({
        error: '❌ Equipos inválidos',
        message: 'Algunos equipos no existen o no pertenecen al usuario'
      });
    }

    // Crear el torneo
    const nuevoTorneo = await Torneo.create({
      nombre,
      tipo,
      estado: 'pendiente',
      usuarioId
    });

    // Asignar equipos al torneo
    await nuevoTorneo.addEquipos(equiposIds);

    // Generar fixture
    await generarFixture(nuevoTorneo.id, equiposIds, tipo);

    // Obtener el torneo con equipos
    const torneoCompleto = await Torneo.findByPk(nuevoTorneo.id, {
      include: [
        {
          model: Equipo,
          as: 'equipos',
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      message: '✅ Torneo creado exitosamente',
      torneo: torneoCompleto
    });
  } catch (error) {
    console.error('Error al crear torneo:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al crear el torneo'
    });
  }
};

// Actualizar torneo
const actualizarTorneo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, estado } = req.body;
    const usuarioId = req.usuario.id;

    // Buscar el torneo
    const torneo = await Torneo.findOne({
      where: { id, usuarioId }
    });

    if (!torneo) {
      return res.status(404).json({
        error: '❌ Torneo no encontrado',
        message: 'El torneo especificado no existe o no pertenece al usuario'
      });
    }

    // Validar que al menos un campo se proporcione
    if (!nombre && !estado) {
      return res.status(400).json({
        error: '❌ Campos requeridos',
        message: 'Debe proporcionar al menos nombre o estado'
      });
    }

    // Validar estado si se proporciona
    if (estado && !['pendiente', 'en_curso', 'finalizado'].includes(estado)) {
      return res.status(400).json({
        error: '❌ Estado inválido',
        message: 'El estado debe ser "pendiente", "en_curso" o "finalizado"'
      });
    }

    // Actualizar torneo
    const datosActualizar = {};
    if (nombre) datosActualizar.nombre = nombre;
    if (estado) datosActualizar.estado = estado;

    await torneo.update(datosActualizar);

    res.json({
      message: '✅ Torneo actualizado exitosamente',
      torneo
    });
  } catch (error) {
    console.error('Error al actualizar torneo:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al actualizar el torneo'
    });
  }
};

// Eliminar torneo
const eliminarTorneo = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Buscar el torneo
    const torneo = await Torneo.findOne({
      where: { id, usuarioId }
    });

    if (!torneo) {
      return res.status(404).json({
        error: '❌ Torneo no encontrado',
        message: 'El torneo especificado no existe o no pertenece al usuario'
      });
    }

    // Verificar si el torneo tiene partidos jugados
    const partidosJugados = await Partido.count({
      where: { torneoId: id, estado: 'jugado' }
    });

    if (partidosJugados > 0) {
      return res.status(400).json({
        error: '❌ No se puede eliminar',
        message: 'No se puede eliminar un torneo que ya tiene partidos jugados'
      });
    }

    // Eliminar el torneo (cascada automática por foreign keys)
    await torneo.destroy();

    res.json({
      message: '✅ Torneo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar torneo:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al eliminar el torneo'
    });
  }
};

// Función para generar fixture
const generarFixture = async (torneoId, equiposIds, tipo) => {
  try {
    if (tipo === 'liga') {
      await generarFixtureLiga(torneoId, equiposIds);
    } else if (tipo === 'eliminacion') {
      await generarFixtureEliminacion(torneoId, equiposIds);
    }
  } catch (error) {
    console.error('Error al generar fixture:', error);
    throw error;
  }
};

// Generar fixture para liga (todos contra todos)
const generarFixtureLiga = async (torneoId, equiposIds) => {
  const partidos = [];
  const fechaBase = new Date();
  let fechaPartido = new Date(fechaBase);

  // Generar todos los partidos posibles
  for (let i = 0; i < equiposIds.length; i++) {
    for (let j = i + 1; j < equiposIds.length; j++) {
      partidos.push({
        torneoId,
        equipoLocalId: equiposIds[i],
        equipoVisitanteId: equiposIds[j],
        fecha: new Date(fechaPartido),
        estado: 'pendiente'
      });

      // Incrementar fecha para el siguiente partido (cada 3 días)
      fechaPartido.setDate(fechaPartido.getDate() + 3);
    }
  }

  // Crear todos los partidos
  await Partido.bulkCreate(partidos);
};

// Generar fixture para eliminación directa
const generarFixtureEliminacion = async (torneoId, equiposIds) => {
  const partidos = [];
  const fechaBase = new Date();
  let fechaPartido = new Date(fechaBase);
  let ronda = 1;

  // Mezclar equipos aleatoriamente
  const equiposMezclados = [...equiposIds].sort(() => Math.random() - 0.5);

  // Generar partidos de la primera ronda
  for (let i = 0; i < equiposMezclados.length; i += 2) {
    partidos.push({
      torneoId,
      equipoLocalId: equiposMezclados[i],
      equipoVisitanteId: equiposMezclados[i + 1],
      fecha: new Date(fechaPartido),
      estado: 'pendiente',
      ronda
    });

    fechaPartido.setDate(fechaPartido.getDate() + 2);
  }

  // Crear partidos de la primera ronda
  await Partido.bulkCreate(partidos);
};

// Obtener tabla de posiciones (solo para ligas)
const obtenerTablaPosiciones = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Verificar que el torneo existe y pertenece al usuario
    const torneo = await Torneo.findOne({
      where: { id, usuarioId }
    });

    if (!torneo) {
      return res.status(404).json({
        error: '❌ Torneo no encontrado',
        message: 'El torneo especificado no existe o no pertenece al usuario'
      });
    }

    if (torneo.tipo !== 'liga') {
      return res.status(400).json({
        error: '❌ Tipo de torneo inválido',
        message: 'La tabla de posiciones solo está disponible para torneos de liga'
      });
    }

    // Obtener equipos del torneo
    const equipos = await torneo.getEquipos();

    // Calcular estadísticas para cada equipo
    const tablaPosiciones = await Promise.all(
      equipos.map(async (equipo) => {
        const partidosJugados = await Partido.count({
          where: {
            torneoId: id,
            estado: 'jugado',
            [Op.or]: [
              { equipoLocalId: equipo.id },
              { equipoVisitanteId: equipo.id }
            ]
          }
        });

        const partidosGanados = await Partido.count({
          where: {
            torneoId: id,
            estado: 'jugado',
            [Op.or]: [
              {
                equipoLocalId: equipo.id,
                golesLocal: { [Op.gt]: require('sequelize').col('golesVisitante') }
              },
              {
                equipoVisitanteId: equipo.id,
                golesVisitante: { [Op.gt]: require('sequelize').col('golesLocal') }
              }
            ]
          }
        });

        const partidosEmpatados = await Partido.count({
          where: {
            torneoId: id,
            estado: 'jugado',
            golesLocal: require('sequelize').col('golesVisitante'),
            [Op.or]: [
              { equipoLocalId: equipo.id },
              { equipoVisitanteId: equipo.id }
            ]
          }
        });

        const partidosPerdidos = partidosJugados - partidosGanados - partidosEmpatados;
        const puntos = (partidosGanados * 3) + partidosEmpatados;

        return {
          equipo: {
            id: equipo.id,
            nombre: equipo.nombre,
            escudo_url: equipo.escudo_url
          },
          partidosJugados,
          partidosGanados,
          partidosEmpatados,
          partidosPerdidos,
          puntos
        };
      })
    );

    // Ordenar por puntos (descendente) y luego por diferencia de goles
    tablaPosiciones.sort((a, b) => {
      if (b.puntos !== a.puntos) {
        return b.puntos - a.puntos;
      }
      // Si tienen los mismos puntos, ordenar por diferencia de goles
      return (b.partidosGanados - b.partidosPerdidos) - (a.partidosGanados - a.partidosPerdidos);
    });

    res.json({
      message: '✅ Tabla de posiciones obtenida exitosamente',
      torneo: {
        id: torneo.id,
        nombre: torneo.nombre,
        tipo: torneo.tipo,
        estado: torneo.estado
      },
      tablaPosiciones
    });
  } catch (error) {
    console.error('Error al obtener tabla de posiciones:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al obtener la tabla de posiciones'
    });
  }
};

module.exports = {
  obtenerTorneos,
  obtenerTorneo,
  crearTorneo,
  actualizarTorneo,
  eliminarTorneo,
  obtenerTablaPosiciones
};
