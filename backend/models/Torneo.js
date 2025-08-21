const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Torneo = sequelize.define('Torneo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      len: [3, 150]
    }
  },
  tipo: {
    type: DataTypes.ENUM('liga', 'eliminacion'),
    allowNull: false,
    defaultValue: 'liga'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_curso', 'finalizado'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  configuracion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Configuración JSON del torneo (formato, puntos, etc.)'
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
  tableName: 'torneos',
  timestamps: true
});

module.exports = Torneo;
