'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('partidos', 'tienePenales', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si el partido tuvo penales'
    });

    await queryInterface.addColumn('partidos', 'penalesLocal', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Goles en penales del equipo local'
    });

    await queryInterface.addColumn('partidos', 'penalesVisitante', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Goles en penales del equipo visitante'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('partidos', 'tienePenales');
    await queryInterface.removeColumn('partidos', 'penalesLocal');
    await queryInterface.removeColumn('partidos', 'penalesVisitante');
  }
};
