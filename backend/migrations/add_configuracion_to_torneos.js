'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('torneos', 'configuracion', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Configuración JSON del torneo (formato, puntos, etc.)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('torneos', 'configuracion');
  }
};
