const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Partido = sequelize.define('Partido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  torneoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'torneos',
      key: 'id'
    }
  },
  equipoLocalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipos',
      key: 'id'
    }
  },
  equipoVisitanteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipos',
      key: 'id'
    }
  },
  golesLocal: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  golesVisitante: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'jugado'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  ronda: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Para torneos de eliminación directa'
  }
}, {
  tableName: 'partidos',
  timestamps: true,
  indexes: [
    {
      fields: ['torneoId']
    },
    {
      fields: ['equipoLocalId']
    },
    {
      fields: ['equipoVisitanteId']
    }
  ]
});

module.exports = Partido;
