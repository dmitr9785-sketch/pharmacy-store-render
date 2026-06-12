const { Order, OrderItem, Product } = require('./models');
const { Op } = require('sequelize');

const PICKUP_DURATION = 120; // секунд до "готов к выдаче"
const DELIVERY_DURATION = 900; // секунд до "завершён"

const pickupSteps = ['новый', 'подтверждён', 'собран', 'готов к выдаче'];
const deliverySteps = ['новый', 'подтверждён', 'собран', 'завершён'];

function getProgress(createdAt, isPickup) {
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 1000;
  const duration = isPickup ? PICKUP_DURATION : DELIVERY_DURATION;
  return Math.min(elapsed / duration, 1);
}

function getTargetStatus(createdAt, isPickup) {
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 1000;
  const duration = isPickup ? PICKUP_DURATION : DELIVERY_DURATION;
  const steps = isPickup ? pickupSteps : deliverySteps;
  const stepIndex = Math.min(
    Math.floor((elapsed / duration) * steps.length),
    steps.length - 1
  );
  return steps[stepIndex];
}

async function updateOrders() {
  try {
    const activeOrders = await Order.findAll({
      where: {
        status: { [Op.in]: ['новый', 'подтверждён', 'собран'] },
      },
    });

    for (const order of activeOrders) {
      const isPickup = order.address && order.address.startsWith('Самовывоз:');
      const target = getTargetStatus(order.createdAt, isPickup);
      if (target !== order.status) {
        order.status = target;
        await order.save();
      }
    }
  } catch (err) {
    console.error('Order updater error:', err.message);
  }
}

function startOrderUpdater(intervalMs = 10000) {
  setInterval(updateOrders, intervalMs);
  console.log('✓ Order updater started (every ' + intervalMs / 1000 + 's)');
}

module.exports = { startOrderUpdater, getTargetStatus, getProgress, PICKUP_DURATION, DELIVERY_DURATION };
