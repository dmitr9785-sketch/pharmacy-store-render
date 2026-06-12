const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  status: {
    type: DataTypes.ENUM('новый', 'подтверждён', 'собран', 'готов к выдаче', 'завершён', 'отменён'),
    defaultValue: 'новый',
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  promoCodeUsed: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deliveryCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  pointsUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  pointsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Order;
