const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  authorName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Аноним',
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Review;
