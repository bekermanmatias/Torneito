const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fechaRegistro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        usuario.passwordHash = await bcrypt.hash(usuario.passwordHash, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('passwordHash')) {
        const salt = await bcrypt.genSalt(10);
        usuario.passwordHash = await bcrypt.hash(usuario.passwordHash, salt);
      }
    }
  }
});

// Método para comparar contraseñas
Usuario.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Método para obtener datos públicos del usuario (sin password)
Usuario.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.passwordHash;
  return values;
};

module.exports = Usuario;
