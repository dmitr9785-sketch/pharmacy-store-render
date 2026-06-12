const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
  },
  manufacturer: {
    type: DataTypes.STRING,
  },
  activeIngredient: {
    type: DataTypes.STRING,
  },
  dosage: {
    type: DataTypes.STRING,
  },
  form: {
    type: DataTypes.ENUM('таблетки', 'капсулы', 'мазь', 'гель', 'сироп', 'раствор', 'спрей', 'капли', 'порошок', 'свечи'),
  },
  requiresPrescription: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  oldPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: 'default-product.png',
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 4.0,
    validate: { min: 2.5, max: 5.0 },
  },
});

module.exports = Product;
