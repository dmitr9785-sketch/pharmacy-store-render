const { Router } = require('express');
const { Order, OrderItem, Product, User } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { getTargetStatus, getProgress } = require('../orderUpdater');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const user = await User.findByPk(req.session.user.id);
  const orders = await Order.findAll({
    where: { userId: req.session.user.id },
    include: [{ model: OrderItem, include: [Product] }],
    order: [['createdAt', 'DESC']],
  });

  const activeStatuses = ['новый', 'подтверждён', 'собран', 'готов к выдаче'];
  const activeOrders = orders.filter(o => activeStatuses.includes(o.status)).map(o => {
    const isPickup = o.address && o.address.startsWith('Самовывоз:');
    o.dataValues.progress = getProgress(o.createdAt, isPickup);
    o.dataValues.targetStatus = getTargetStatus(o.createdAt, isPickup);
    return o;
  });
  const historyOrders = orders.filter(o => !activeStatuses.includes(o.status));

  res.render('profile/index', { title: 'Личный кабинет', activeOrders, historyOrders, userPoints: user.points });
});

router.post('/:id/cancel', requireAuth, async (req, res) => {
  const order = await Order.findOne({
    where: { id: req.params.id, userId: req.session.user.id },
    include: [{ model: OrderItem }],
  });
  if (order && (order.status === 'новый' || order.status === 'подтверждён')) {
    for (const item of order.OrderItems) {
      await Product.increment('stock', { by: item.quantity, where: { id: item.productId } });
    }
    order.status = 'отменён';
    await order.save();
  }
  res.redirect('/profile');
});

router.post('/:id/received', requireAuth, async (req, res) => {
  const order = await Order.findOne({ where: { id: req.params.id, userId: req.session.user.id } });
  if (order && (order.status === 'собран' || order.status === 'готов к выдаче')) {
    order.status = 'завершён';
    await order.save();
  }
  res.redirect('/profile');
});

module.exports = router;
