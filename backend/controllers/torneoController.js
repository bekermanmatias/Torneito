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
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Procesar cada torneo para agregar información del campeón
    const torneosConCampeon = torneos.map(torneo => {
      const torneoData = torneo.toJSON();
      
      // Si el torneo está finalizado, buscar el campeón
      let campeon = null;
      if (torneo.estado === 'finalizado') {
        if (torneo.tipo === 'eliminacion') {
          const partidosJugados = torneo.partidos.filter(p => p.estado === 'jugado');
          
          if (partidosJugados.length > 0) {
            const maxRonda = Math.max(...partidosJugados.map(p => p.ronda));
            const final = partidosJugados.find(p => p.ronda === maxRonda);
            
            if (final) {
              if (final.golesLocal > final.golesVisitante) {
                campeon = final.equipoLocal;
              } else if (final.golesVisitante > final.golesLocal) {
                campeon = final.equipoVisitante;
              }
            }
          }
        } else if (torneo.tipo === 'liga') {
          // Para liga, el campeón es el equipo con más puntos
          const partidosJugados = torneo.partidos.filter(p => p.estado === 'jugado');
          
          if (partidosJugados.length > 0) {
            // Calcular estadísticas de cada equipo
            const estadisticas = {};
            
            // Inicializar estadísticas
            torneo.equipos.forEach(equipo => {
              estadisticas[equipo.id] = {
                equipo,
                puntos: 0,
                diferenciaGoles: 0,
                golesFavor: 0
              };
            });
            
            // Calcular puntos de partidos jugados
            partidosJugados.forEach(partido => {
              if (partido.golesLocal !== null && partido.golesVisitante !== null) {
                const equipoLocal = estadisticas[partido.equipoLocalId];
                const equipoVisitante = estadisticas[partido.equipoVisitanteId];
                
                if (equipoLocal && equipoVisitante) {
                  // Actualizar goles
                  equipoLocal.golesFavor += partido.golesLocal;
                  equipoLocal.diferenciaGoles += (partido.golesLocal - partido.golesVisitante);
                  equipoVisitante.golesFavor += partido.golesVisitante;
                  equipoVisitante.diferenciaGoles += (partido.golesVisitante - partido.golesLocal);
                  
                  // Determinar puntos
                  if (partido.golesLocal > partido.golesVisitante) {
                    equipoLocal.puntos += 3;
                  } else if (partido.golesVisitante > partido.golesLocal) {
                    equipoVisitante.puntos += 3;
                  } else {
                    equipoLocal.puntos += 1;
                    equipoVisitante.puntos += 1;
                  }
                }
              }
            });
            
            // Encontrar el campeón (más puntos, luego diferencia de goles, luego goles a favor)
            const equiposOrdenados = Object.values(estadisticas).sort((a, b) => {
              if (b.puntos !== a.puntos) return b.puntos - a.puntos;
              if (b.diferenciaGoles !== a.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
              return b.golesFavor - a.golesFavor;
            });
            
            if (equiposOrdenados.length > 0) {
              campeon = equiposOrdenados[0].equipo;
            }
          }
        }
      }
      
      return {
        ...torneoData,
        campeon
      };
    });

    res.json({
      message: '✅ Torneos obtenidos exitosamente',
      data: torneosConCampeon,
      total: torneosConCampeon.length
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

    // Si el torneo está finalizado, buscar el campeón
    let campeon = null;
    if (torneo.estado === 'finalizado') {
      if (torneo.tipo === 'eliminacion') {
        // Buscar el partido de la ronda más alta (la final)
        const partidosJugados = torneo.partidos.filter(p => p.estado === 'jugado');
        
        if (partidosJugados.length > 0) {
          // Encontrar la ronda más alta
          const maxRonda = Math.max(...partidosJugados.map(p => p.ronda));
          
          // Buscar el partido de la final
          const final = partidosJugados.find(p => p.ronda === maxRonda);
          
          if (final) {
            if (final.golesLocal > final.golesVisitante) {
              campeon = final.equipoLocal;
            } else if (final.golesVisitante > final.golesLocal) {
              campeon = final.equipoVisitante;
            }
          }
        }
      } else if (torneo.tipo === 'liga') {
        // Para liga, el campeón es el equipo con más puntos
        const partidosJugados = torneo.partidos.filter(p => p.estado === 'jugado');
        
        if (partidosJugados.length > 0) {
          // Calcular estadísticas de cada equipo
          const estadisticas = {};
          
          // Inicializar estadísticas
          torneo.equipos.forEach(equipo => {
            estadisticas[equipo.id] = {
              equipo,
              puntos: 0,
              diferenciaGoles: 0,
              golesFavor: 0
            };
          });
          
          // Calcular puntos de partidos jugados
          partidosJugados.forEach(partido => {
            if (partido.golesLocal !== null && partido.golesVisitante !== null) {
              const equipoLocal = estadisticas[partido.equipoLocalId];
              const equipoVisitante = estadisticas[partido.equipoVisitanteId];
              
              if (equipoLocal && equipoVisitante) {
                // Actualizar goles
                equipoLocal.golesFavor += partido.golesLocal;
                equipoLocal.diferenciaGoles += (partido.golesLocal - partido.golesVisitante);
                equipoVisitante.golesFavor += partido.golesVisitante;
                equipoVisitante.diferenciaGoles += (partido.golesVisitante - partido.golesLocal);
                
                // Determinar puntos
                if (partido.golesLocal > partido.golesVisitante) {
                  equipoLocal.puntos += 3;
                } else if (partido.golesVisitante > partido.golesLocal) {
                  equipoVisitante.puntos += 3;
                } else {
                  equipoLocal.puntos += 1;
                  equipoVisitante.puntos += 1;
                }
              }
            }
          });
          
          // Encontrar el campeón (más puntos, luego diferencia de goles, luego goles a favor)
          const equiposOrdenados = Object.values(estadisticas).sort((a, b) => {
            if (b.puntos !== a.puntos) return b.puntos - a.puntos;
            if (b.diferenciaGoles !== a.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
            return b.golesFavor - a.golesFavor;
          });
          
          if (equiposOrdenados.length > 0) {
            campeon = equiposOrdenados[0].equipo;
          }
        }
      }
    }

    res.json({
      message: '✅ Torneo obtenido exitosamente',
      torneo: {
        ...torneo.toJSON(),
        campeon
      }
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
    const { nombre, tipo, equiposIds, equiposNuevos, configuracion } = req.body;
    const usuarioId = req.usuario.id;

    // Validar campos requeridos
    if (!nombre || !tipo) {
      return res.status(400).json({
        error: '❌ Campos requeridos',
        message: 'Nombre y tipo son obligatorios'
      });
    }

    // Validar que se proporcionen equipos (existentes o nuevos)
    if ((!equiposIds || equiposIds.length === 0) && (!equiposNuevos || equiposNuevos.length === 0)) {
      return res.status(400).json({
        error: '❌ Equipos requeridos',
        message: 'Debe proporcionar al menos un equipo (existente o nuevo)'
      });
    }

    // Validar tipo de torneo
    if (!['liga', 'eliminacion'].includes(tipo)) {
      return res.status(400).json({
        error: '❌ Tipo inválido',
        message: 'El tipo debe ser "liga" o "eliminacion"'
      });
    }

    // Preparar lista final de equipos
    let equiposFinales = [];

    // Agregar equipos existentes si se proporcionan
    if (equiposIds && Array.isArray(equiposIds) && equiposIds.length > 0) {
      const equiposExistentes = await Equipo.findAll({
        where: {
          id: { [Op.in]: equiposIds }
        }
      });

      if (equiposExistentes.length !== equiposIds.length) {
        return res.status(400).json({
          error: '❌ Equipos inválidos',
          message: 'Algunos equipos no existen'
        });
      }
      equiposFinales = equiposExistentes;
    }

    // Crear equipos nuevos si se proporcionan
    if (equiposNuevos && Array.isArray(equiposNuevos) && equiposNuevos.length > 0) {
      for (const nombreEquipo of equiposNuevos) {
        if (nombreEquipo && nombreEquipo.trim()) {
          try {
            const nuevoEquipo = await Equipo.create({
              nombre: nombreEquipo.trim(),
              usuarioId
            });
            equiposFinales.push(nuevoEquipo);
          } catch (error) {
            if (error.name === 'SequelizeValidationError') {
              return res.status(400).json({
                error: '❌ Nombre de equipo inválido',
                message: `El equipo "${nombreEquipo}" no es válido: ${error.errors[0].message}`
              });
            }
            throw error;
          }
        }
      }
    }

    // Validar número mínimo de equipos
    if (equiposFinales.length < 2) {
      return res.status(400).json({
        error: '❌ Equipos insuficientes',
        message: 'Se requieren al menos 2 equipos para crear un torneo'
      });
    }

    // Para eliminación directa, verificar que sea potencia de 2
    if (tipo === 'eliminacion') {
      const esPotenciaDe2 = (equiposFinales.length & (equiposFinales.length - 1)) === 0;
      if (!esPotenciaDe2) {
        return res.status(400).json({
          error: '❌ Número de equipos inválido',
          message: 'Para eliminación directa, el número de equipos debe ser una potencia de 2 (2, 4, 8, 16, etc.)'
        });
      }
    }

    // Crear el torneo con configuración
    const datosTorneo = {
      nombre,
      tipo,
      estado: 'pendiente',
      usuarioId
    };

    // Agregar configuración si se proporciona
    if (configuracion) {
      datosTorneo.configuracion = JSON.stringify(configuracion);
    }

    const nuevoTorneo = await Torneo.create(datosTorneo);

    // Obtener IDs de los equipos finales
    const equiposIdsFinales = equiposFinales.map(equipo => equipo.id);

    // Asignar equipos al torneo
    await nuevoTorneo.addEquipos(equiposIdsFinales);

    // Generar fixture
    await generarFixture(nuevoTorneo.id, equiposIdsFinales, tipo);

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
  
  console.log(`✅ Generada primera ronda con ${partidos.length} partidos para torneo ${torneoId}`);
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
