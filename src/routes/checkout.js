const { Router } = require('express');
const { Order, OrderItem, Product, Store, Promotion, User } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/cart');

  const ids = cart.map(i => i.productId);
  const products = ids.length ? await Product.findAll({ where: { id: ids } }) : [];
  const hasPrescription = products.some(p => p.requiresPrescription);
  const stores = await Store.findAll({ order: [['name', 'ASC']] });

  const promoError = req.session.promoError;
  req.session.promoError = null;

  const cartTotal = products.reduce((sum, p) => {
    const c = cart.find(i => i.productId === p.id);
    return sum + parseFloat(p.price) * (c ? c.quantity : 0);
  }, 0);

  const user = await User.findByPk(req.session.user.id);

  res.render('checkout/index', { title: 'Оформление заказа', hasPrescription, stores, promoError, cartTotal, userPoints: user.points });
});

router.post('/', requireAuth, async (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/cart');

  const ids = cart.map(i => i.productId);
  const products = await Product.findAll({ where: { id: ids } });

  for (const c of cart) {
    const p = products.find(pr => pr.id === c.productId);
    if (!p || p.stock < c.quantity) {
      req.session.cartError = 'Недостаточно товара "' + (p ? p.name : '?') + '" на складе. Доступно: ' + (p ? p.stock : 0) + ' шт.';
      return res.redirect('/cart');
    }
  }

  let total = 0;
  const items = cart.map(c => {
    const p = products.find(pr => pr.id === c.productId);
    total += parseFloat(p.price) * c.quantity;
    return { productId: c.productId, quantity: c.quantity, price: parseFloat(p.price) };
  });

  // Промокод
  let discount = 0;
  let promoCodeUsed = null;
  let discountAmount = 0;
  const promoCode = req.body.promoCode ? req.body.promoCode.trim().toUpperCase() : '';
  if (promoCode) {
    const promotion = await Promotion.findOne({
      where: { promoCode, requiresPromoCode: true, isActive: true },
    });
    if (promotion) {
      const alreadyUsed = await Order.findOne({ where: { promoCodeUsed: promoCode } });
      if (alreadyUsed) {
        req.session.promoError = 'Промокод уже использован';
        return res.redirect('/checkout');
      }
      discount = promotion.discountPercent;
      promoCodeUsed = promoCode;
      if (promotion.applicableCategoryId) {
        const eligibleItems = items.filter(item => {
          const p = products.find(pr => pr.id === item.productId);
          return p && p.categoryId === promotion.applicableCategoryId;
        });
        const eligibleTotal = eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        discountAmount = eligibleTotal * (discount / 100);
      } else {
        discountAmount = total * (discount / 100);
      }
    } else {
      req.session.promoError = 'Промокод не существует';
      return res.redirect('/checkout');
    }
  }

  const totalWithDiscount = total - discountAmount;

  // Способ получения
  const hasPrescription = products.some(p => p.requiresPrescription);
  const deliveryMethod = req.body.deliveryMethod;
  let address, deliveryCost;

  if (hasPrescription || deliveryMethod === 'pickup') {
    const store = await Store.findByPk(req.body.storeId);
    if (!store) return res.redirect('/checkout');
    address = 'Самовывоз: ' + store.name + ' — ' + store.address;
    deliveryCost = 0;
  } else {
    address = req.body.address;
    deliveryCost = totalWithDiscount >= 2000 ? 0 : 250;
  }

  let finalTotal = totalWithDiscount + deliveryCost;

  // Бонусные баллы (100 баллов = 1 ₽)
  const user = await User.findByPk(req.session.user.id);
  const pointsInput = parseInt(req.body.pointsToUse) || 0;
  const maxPoints = Math.min(user.points, Math.floor(finalTotal * 0.9 * 100));
  const pointsUsed = Math.min(pointsInput, maxPoints);
  const pointsDiscount = pointsUsed / 100;
  const totalAfterPoints = finalTotal - pointsDiscount;
  const pointsEarned = Math.floor(totalAfterPoints);

  const order = await Order.create({
    userId: req.session.user.id,
    total: totalAfterPoints.toFixed(2),
    address,
    phone: req.body.phone,
    discount,
    promoCodeUsed,
    deliveryCost,
    pointsUsed,
    pointsEarned,
  });

  for (const item of items) {
    await OrderItem.create({ ...item, orderId: order.id });
    await Product.decrement('stock', { by: item.quantity, where: { id: item.productId } });
  }

  // Обновить баллы пользователя
  user.points = user.points - pointsUsed + pointsEarned;
  await user.save();

  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };

  req.session.cart = [];
  res.render('checkout/success', { title: 'Заказ оформлен', order, discount, originalTotal: total.toFixed(2), deliveryCost, pointsUsed, pointsEarned, pointsBalance: user.points });
});

module.exports = router;
