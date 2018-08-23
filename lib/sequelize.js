const Sequelize = require('sequelize');
const cfg = require('../config').db;

const sequelize = new Sequelize(cfg.connectionURI, {
  operatorsAliases: Sequelize.Op,
  define: {
    freezeTableName: true,
  },
});

module.exports = sequelize;
