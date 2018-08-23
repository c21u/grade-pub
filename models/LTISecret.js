const Sequelize = require('sequelize');
const seq = require('../lib/sequelize.js');

const LTISecret = seq.define('LTISecret', {
  key: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  secret: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = LTISecret;
