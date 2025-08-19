const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Equipo = sequelize.define('Equipo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: {
        args: [2, 100],
        msg: 'El nombre del equipo debe tener entre 2 y 100 caracteres'
      },
      notEmpty: {
        msg: 'El nombre del equipo no puede estar vacío'
      }
    }
  },
  escudo_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  }
}, {
  tableName: 'equipos',
  timestamps: true
});

module.exports = Equipo;
