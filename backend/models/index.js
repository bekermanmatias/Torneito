const Usuario = require('./Usuario');
const Equipo = require('./Equipo');
const Torneo = require('./Torneo');
const TorneoEquipo = require('./TorneoEquipo');
const Partido = require('./Partido');

// Relaciones Usuario - Equipo (1:N)
Usuario.hasMany(Equipo, { foreignKey: 'usuarioId', as: 'equipos' });
Equipo.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Relaciones Usuario - Torneo (1:N)
Usuario.hasMany(Torneo, { foreignKey: 'usuarioId', as: 'torneos' });
Torneo.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Relaciones Torneo - Equipo (N:N a través de TorneoEquipo)
Torneo.belongsToMany(Equipo, { 
  through: TorneoEquipo, 
  foreignKey: 'torneoId',
  otherKey: 'equipoId',
  as: 'equipos'
});
Equipo.belongsToMany(Torneo, { 
  through: TorneoEquipo, 
  foreignKey: 'equipoId',
  otherKey: 'torneoId',
  as: 'torneos'
});

// Relaciones Torneo - Partido (1:N)
Torneo.hasMany(Partido, { foreignKey: 'torneoId', as: 'partidos' });
Partido.belongsTo(Torneo, { foreignKey: 'torneoId', as: 'torneo' });

// Relaciones Partido - Equipo (N:1 para equipo local y visitante)
Partido.belongsTo(Equipo, { 
  foreignKey: 'equipoLocalId', 
  as: 'equipoLocal' 
});
Partido.belongsTo(Equipo, { 
  foreignKey: 'equipoVisitanteId', 
  as: 'equipoVisitante' 
});

// Relaciones Equipo - Partido (1:N como local y visitante)
Equipo.hasMany(Partido, { 
  foreignKey: 'equipoLocalId', 
  as: 'partidosLocal' 
});
Equipo.hasMany(Partido, { 
  foreignKey: 'equipoVisitanteId', 
  as: 'partidosVisitante' 
});

module.exports = {
  Usuario,
  Equipo,
  Torneo,
  TorneoEquipo,
  Partido
};
