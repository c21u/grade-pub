const Sequelize = require('sequelize');
const databaseURL = require("../config")["database"]["url"];

const sequelize = new Sequelize(databaseURL, {
  operatorsAliases: Sequelize.Op,
  define: {
    freezeTableName: true
  }
});

module.exports = sequelize;
