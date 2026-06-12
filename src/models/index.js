const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Store = require('./Store');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Promotion = require('./Promotion');

Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

Promotion.belongsTo(Category, { foreignKey: 'applicableCategoryId', as: 'category' });
Category.hasMany(Promotion, { foreignKey: 'applicableCategoryId', as: 'promotions' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Store,
  Order,
  OrderItem,
  Review,
  Promotion,
};
