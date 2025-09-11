const { Partido, Torneo, Equipo } = require('../models');
const { Op } = require('sequelize');

// Obtener partidos de un torneo
const obtenerPartidosTorneo = async (req, res) => {
  try {
    const { torneoId } = req.params;
    const usuarioId = req.usuario.id;

    // Verificar que el torneo pertenece al usuario
    const torneo = await Torneo.findOne({
      where: { id: torneoId, usuarioId }
    });

    if (!torneo) {
      return res.status(404).json({
        error: '❌ Torneo no encontrado',
        message: 'El torneo especificado no existe o no pertenece al usuario'
      });
    }

    // Obtener partidos del torneo
    const partidos = await Partido.findAll({
      where: { torneoId },
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
      order: [['fecha', 'ASC'], ['ronda', 'ASC']]
    });

    res.json({
      message: '✅ Partidos obtenidos exitosamente',
      torneo: {
        id: torneo.id,
        nombre: torneo.nombre,
        tipo: torneo.tipo,
        estado: torneo.estado
      },
      partidos,
      total: partidos.length
    });
  } catch (error) {
    console.error('Error al obtener partidos:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al obtener los partidos'
    });
  }
};

// Obtener un partido específico
const obtenerPartido = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const partido = await Partido.findOne({
      where: { id },
      include: [
        {
          model: Torneo,
          as: 'torneo',
          where: { usuarioId },
          attributes: ['id', 'nombre', 'tipo', 'estado']
        },
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
      ]
    });

    if (!partido) {
      return res.status(404).json({
        error: '❌ Partido no encontrado',
        message: 'El partido especificado no existe o no pertenece al usuario'
      });
    }

    res.json({
      message: '✅ Partido obtenido exitosamente',
      partido
    });
  } catch (error) {
    console.error('Error al obtener partido:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al obtener el partido'
    });
  }
};

// Registrar resultado de un partido
const registrarResultado = async (req, res) => {
  try {
    const { id } = req.params;
    const { golesLocal, golesVisitante, tienePenales, penalesLocal, penalesVisitante } = req.body;
    const usuarioId = req.usuario.id;

    // Validar campos requeridos
    if (golesLocal === undefined || golesVisitante === undefined) {
      return res.status(400).json({
        error: '❌ Campos requeridos',
        message: 'Goles local y goles visitante son obligatorios'
      });
    }

    // Validar que los goles sean números no negativos
    if (golesLocal < 0 || golesVisitante < 0) {
      return res.status(400).json({
        error: '❌ Goles inválidos',
        message: 'Los goles no pueden ser negativos'
      });
    }

    // Validar penales si se especifican
    if (tienePenales) {
      if (penalesLocal === undefined || penalesVisitante === undefined) {
        return res.status(400).json({
          error: '❌ Penales requeridos',
          message: 'Si el partido tuvo penales, debe especificar los goles en penales de ambos equipos'
        });
      }
      
      if (penalesLocal < 0 || penalesVisitante < 0) {
        return res.status(400).json({
          error: '❌ Penales inválidos',
          message: 'Los goles en penales no pueden ser negativos'
        });
      }

      // Verificar que hay empate en el tiempo regular
      if (golesLocal !== golesVisitante) {
        return res.status(400).json({
          error: '❌ Penales inválidos',
          message: 'Los penales solo se pueden usar cuando hay empate en el tiempo regular'
        });
      }
    }

    // Buscar el partido
    const partido = await Partido.findOne({
      where: { id },
      include: [
        {
          model: Torneo,
          as: 'torneo',
          where: { usuarioId },
          attributes: ['id', 'nombre', 'tipo', 'estado']
        },
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
      ]
    });

    if (!partido) {
      return res.status(404).json({
        error: '❌ Partido no encontrado',
        message: 'El partido especificado no existe o no pertenece al usuario'
      });
    }

    // Verificar que el partido no esté ya jugado
    if (partido.estado === 'jugado') {
      return res.status(400).json({
        error: '❌ Partido ya jugado',
        message: 'Este partido ya tiene un resultado registrado'
      });
    }

    // Preparar datos para actualizar
    const datosActualizacion = {
      golesLocal,
      golesVisitante,
      estado: 'jugado',
      tienePenales: tienePenales || false
    };

    // Agregar penales si se especificaron
    if (tienePenales) {
      datosActualizacion.penalesLocal = penalesLocal;
      datosActualizacion.penalesVisitante = penalesVisitante;
    }

    // Actualizar el partido
    await partido.update(datosActualizacion);

    // Si es un torneo de eliminación, verificar si necesitamos generar la siguiente ronda
    if (partido.torneo.tipo === 'eliminacion') {
      await generarSiguienteRonda(partido.torneoId, partido.ronda);
    }

    // Obtener el partido actualizado con equipos
    const partidoActualizado = await Partido.findByPk(id, {
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
      ]
    });

    res.json({
      message: '✅ Resultado registrado exitosamente',
      partido: partidoActualizado
    });
  } catch (error) {
    console.error('Error al registrar resultado:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al registrar el resultado'
    });
  }
};

// Actualizar resultado de un partido
const actualizarResultado = async (req, res) => {
  try {
    const { id } = req.params;
    const { golesLocal, golesVisitante, tienePenales, penalesLocal, penalesVisitante } = req.body;
    const usuarioId = req.usuario.id;

    // Validar campos requeridos
    if (golesLocal === undefined || golesVisitante === undefined) {
      return res.status(400).json({
        error: '❌ Campos requeridos',
        message: 'Goles local y goles visitante son obligatorios'
      });
    }

    // Validar que los goles sean números no negativos
    if (golesLocal < 0 || golesVisitante < 0) {
      return res.status(400).json({
        error: '❌ Goles inválidos',
        message: 'Los goles no pueden ser negativos'
      });
    }

    // Validar penales si se especifican
    if (tienePenales) {
      if (penalesLocal === undefined || penalesVisitante === undefined) {
        return res.status(400).json({
          error: '❌ Penales requeridos',
          message: 'Si el partido tuvo penales, debe especificar los goles en penales de ambos equipos'
        });
      }
      
      if (penalesLocal < 0 || penalesVisitante < 0) {
        return res.status(400).json({
          error: '❌ Penales inválidos',
          message: 'Los goles en penales no pueden ser negativos'
        });
      }

      // Verificar que hay empate en el tiempo regular
      if (golesLocal !== golesVisitante) {
        return res.status(400).json({
          error: '❌ Penales inválidos',
          message: 'Los penales solo se pueden usar cuando hay empate en el tiempo regular'
        });
      }
    }

    // Buscar el partido
    const partido = await Partido.findOne({
      where: { id },
      include: [
        {
          model: Torneo,
          as: 'torneo',
          where: { usuarioId },
          attributes: ['id', 'nombre', 'tipo', 'estado']
        }
      ]
    });

    if (!partido) {
      return res.status(404).json({
        error: '❌ Partido no encontrado',
        message: 'El partido especificado no existe o no pertenece al usuario'
      });
    }

    // Verificar que el partido esté jugado
    if (partido.estado !== 'jugado') {
      return res.status(400).json({
        error: '❌ Partido no jugado',
        message: 'Este partido aún no tiene un resultado registrado'
      });
    }

    // Para torneos de eliminación, no permitir editar partidos ya jugados
    if (partido.torneo.tipo === 'eliminacion') {
      return res.status(400).json({
        error: '❌ No se puede editar',
        message: 'No se puede editar el resultado de un partido ya jugado en torneos de eliminación directa'
      });
    }

    // Preparar datos para actualizar
    const datosActualizacion = {
      golesLocal,
      golesVisitante,
      tienePenales: tienePenales || false
    };

    // Agregar penales si se especificaron
    if (tienePenales) {
      datosActualizacion.penalesLocal = penalesLocal;
      datosActualizacion.penalesVisitante = penalesVisitante;
    } else {
      // Limpiar penales si no se especificaron
      datosActualizacion.penalesLocal = null;
      datosActualizacion.penalesVisitante = null;
    }

    // Actualizar el partido
    await partido.update(datosActualizacion);

    // Obtener el partido actualizado con equipos
    const partidoActualizado = await Partido.findByPk(id, {
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
      ]
    });

    res.json({
      message: '✅ Resultado actualizado exitosamente',
      partido: partidoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar resultado:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al actualizar el resultado'
    });
  }
};

// Eliminar resultado de un partido (marcar como pendiente)
const eliminarResultado = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Buscar el partido
    const partido = await Partido.findOne({
      where: { id },
      include: [
        {
          model: Torneo,
          as: 'torneo',
          where: { usuarioId },
          attributes: ['id', 'nombre', 'tipo', 'estado']
        }
      ]
    });

    if (!partido) {
      return res.status(404).json({
        error: '❌ Partido no encontrado',
        message: 'El partido especificado no existe o no pertenece al usuario'
      });
    }

    // Verificar que el partido esté jugado
    if (partido.estado !== 'jugado') {
      return res.status(400).json({
        error: '❌ Partido no jugado',
        message: 'Este partido no tiene un resultado registrado'
      });
    }

    // Para torneos de eliminación, no permitir eliminar resultados
    if (partido.torneo.tipo === 'eliminacion') {
      return res.status(400).json({
        error: '❌ No se puede eliminar',
        message: 'No se puede eliminar el resultado de un partido en torneos de eliminación directa'
      });
    }

    // Marcar como pendiente y limpiar goles y penales
    await partido.update({
      golesLocal: null,
      golesVisitante: null,
      tienePenales: false,
      penalesLocal: null,
      penalesVisitante: null,
      estado: 'pendiente'
    });

    // Obtener el partido actualizado con equipos
    const partidoActualizado = await Partido.findByPk(id, {
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
      ]
    });

    res.json({
      message: '✅ Resultado eliminado exitosamente',
      partido: partidoActualizado
    });
  } catch (error) {
    console.error('Error al eliminar resultado:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al eliminar el resultado'
    });
  }
};

// Obtener estadísticas de un equipo en un torneo
const obtenerEstadisticasEquipo = async (req, res) => {
  try {
    const { torneoId, equipoId } = req.params;
    const usuarioId = req.usuario.id;

    // Verificar que el torneo pertenece al usuario
    const torneo = await Torneo.findOne({
      where: { id: torneoId, usuarioId }
    });

    if (!torneo) {
      return res.status(404).json({
        error: '❌ Torneo no encontrado',
        message: 'El torneo especificado no existe o no pertenece al usuario'
      });
    }

    // Verificar que el equipo pertenece al usuario
    const equipo = await Equipo.findOne({
      where: { id: equipoId, usuarioId }
    });

    if (!equipo) {
      return res.status(404).json({
        error: '❌ Equipo no encontrado',
        message: 'El equipo especificado no existe o no pertenece al usuario'
      });
    }

    // Obtener partidos del equipo en el torneo
    const partidos = await Partido.findAll({
      where: {
        torneoId,
        estado: 'jugado',
        [Op.or]: [
          { equipoLocalId: equipoId },
          { equipoVisitanteId: equipoId }
        ]
      },
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
    });

    // Calcular estadísticas
    let partidosJugados = 0;
    let partidosGanados = 0;
    let partidosEmpatados = 0;
    let partidosPerdidos = 0;
    let golesFavor = 0;
    let golesContra = 0;

    partidos.forEach(partido => {
      partidosJugados++;
      
      const esLocal = partido.equipoLocalId === parseInt(equipoId);
      const golesEquipo = esLocal ? partido.golesLocal : partido.golesVisitante;
      const golesRival = esLocal ? partido.golesVisitante : partido.golesLocal;
      
      golesFavor += golesEquipo;
      golesContra += golesRival;

      // Determinar el resultado considerando penales
      let resultado = 'empate';
      if (golesEquipo > golesRival) {
        resultado = 'victoria';
      } else if (golesEquipo < golesRival) {
        resultado = 'derrota';
      } else if (partido.tienePenales) {
        // En caso de empate, verificar penales
        const penalesEquipo = esLocal ? partido.penalesLocal : partido.penalesVisitante;
        const penalesRival = esLocal ? partido.penalesVisitante : partido.penalesLocal;
        
        if (penalesEquipo > penalesRival) {
          resultado = 'victoria';
        } else if (penalesEquipo < penalesRival) {
          resultado = 'derrota';
        }
      }

      switch (resultado) {
        case 'victoria':
          partidosGanados++;
          break;
        case 'derrota':
          partidosPerdidos++;
          break;
        default:
          partidosEmpatados++;
      }
    });

    const puntos = (partidosGanados * 3) + partidosEmpatados;
    const diferenciaGoles = golesFavor - golesContra;

    res.json({
      message: '✅ Estadísticas obtenidas exitosamente',
      equipo: {
        id: equipo.id,
        nombre: equipo.nombre,
        escudo_url: equipo.escudo_url
      },
      torneo: {
        id: torneo.id,
        nombre: torneo.nombre,
        tipo: torneo.tipo
      },
      estadisticas: {
        partidosJugados,
        partidosGanados,
        partidosEmpatados,
        partidosPerdidos,
        golesFavor,
        golesContra,
        diferenciaGoles,
        puntos
      },
      partidos
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: '❌ Error interno del servidor',
      message: 'Error al obtener las estadísticas'
    });
  }
};

// Función para generar la siguiente ronda en torneos de eliminación
const generarSiguienteRonda = async (torneoId, rondaActual) => {
  try {
    
    // Verificar si todos los partidos de la ronda actual están completados
    const partidosRondaActual = await Partido.findAll({
      where: {
        torneoId,
        ronda: rondaActual
      }
    });
    
    const partidosCompletados = partidosRondaActual.filter(p => p.estado === 'jugado');
    
    // Si no todos los partidos están completados, no generar siguiente ronda
    if (partidosCompletados.length !== partidosRondaActual.length) {
      return;
    }

    // Verificar si ya existe la siguiente ronda
    const siguienteRonda = rondaActual + 1;
    const partidosSiguienteRonda = await Partido.findAll({
      where: {
        torneoId,
        ronda: siguienteRonda
      }
    });

    if (partidosSiguienteRonda.length > 0) {
      return; // Ya existe la siguiente ronda
    }

    // Obtener los ganadores de la ronda actual
    const ganadores = [];
    for (const partido of partidosCompletados) {
      
      // Determinar el ganador considerando penales
      let ganador = null;
      if (partido.golesLocal > partido.golesVisitante) {
        ganador = partido.equipoLocalId;
      } else if (partido.golesVisitante > partido.golesLocal) {
        ganador = partido.equipoVisitanteId;
      } else if (partido.tienePenales) {
        // En caso de empate, verificar penales
        if (partido.penalesLocal > partido.penalesVisitante) {
          ganador = partido.equipoLocalId;
        } else if (partido.penalesVisitante > partido.penalesLocal) {
          ganador = partido.equipoVisitanteId;
        }
      }
      
      if (ganador) {
        ganadores.push(ganador);
      }
    }

    // Si solo queda un ganador, es la final
    if (ganadores.length === 1) {
      // El torneo ha terminado
      await Torneo.update(
        { estado: 'finalizado' },
        { where: { id: torneoId } }
      );
      return;
    }

    // Si no hay ganadores (todos empates sin penales), no generar siguiente ronda
    if (ganadores.length === 0) {
      return;
    }

    // Si hay un número impar de ganadores, el último pasa directamente
    if (ganadores.length % 2 !== 0) {
      // El último equipo pasa directamente a la siguiente ronda
    }

    // Generar partidos para la siguiente ronda
    const partidosNuevaRonda = [];
    const fechaBase = new Date();
    let fechaPartido = new Date(fechaBase);

    for (let i = 0; i < ganadores.length; i += 2) {
      if (i + 1 < ganadores.length) {
        partidosNuevaRonda.push({
          torneoId,
          equipoLocalId: ganadores[i],
          equipoVisitanteId: ganadores[i + 1],
          fecha: new Date(fechaPartido),
          estado: 'pendiente',
          ronda: siguienteRonda
        });

        fechaPartido.setDate(fechaPartido.getDate() + 2);
      } else {
        // Si queda un equipo sin pareja, pasa directamente a la siguiente ronda
      }
    }

    // Crear los partidos de la nueva ronda
    if (partidosNuevaRonda.length > 0) {
      await Partido.bulkCreate(partidosNuevaRonda);
    }

  } catch (error) {
    console.error('Error al generar siguiente ronda:', error);
    throw error;
  }
};

module.exports = {
  obtenerPartidosTorneo,
  obtenerPartido,
  registrarResultado,
  actualizarResultado,
  eliminarResultado,
  obtenerEstadisticasEquipo
};
