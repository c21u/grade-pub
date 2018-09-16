const Sequelize = require('sequelize');

const sequelize = new Sequelize(require("../config")["databaseURL"], {
  operatorsAliases: Sequelize.Op,
  define: {
    freezeTableName: true
  }
});

module.exports = sequelize;
