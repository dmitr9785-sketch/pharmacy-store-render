const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  badgeText: { type: DataTypes.STRING },
  discountPercent: { type: DataTypes.INTEGER, defaultValue: 0 },
  requiresPromoCode: { type: DataTypes.BOOLEAN, defaultValue: false },
  promoCode: { type: DataTypes.STRING },
  requirements: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  maxUses: { type: DataTypes.INTEGER, defaultValue: 1 },
  usedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  applicableCategoryId: { type: DataTypes.INTEGER, allowNull: true },
});

module.exports = Promotion;
