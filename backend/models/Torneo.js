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
  banner_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL del banner/imagen de fondo del torneo'
  },
  banner_position: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: { x: 50, y: 50 },
    comment: 'Posición del banner en porcentaje {x, y}'
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
