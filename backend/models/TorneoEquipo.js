const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TorneoEquipo = sequelize.define('TorneoEquipo', {
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
  equipoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipos',
      key: 'id'
    }
  }
}, {
  tableName: 'torneo_equipos',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['torneoId', 'equipoId']
    }
  ]
});

module.exports = TorneoEquipo;
