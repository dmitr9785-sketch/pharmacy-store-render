const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lat: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
  lng: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  workingHours: {
    type: DataTypes.STRING,
  },
});

module.exports = Store;
