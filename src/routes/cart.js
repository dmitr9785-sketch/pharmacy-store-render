const { Router } = require('express');
const { Product } = require('../models');
const { productImage } = require('../helpers');

const router = Router();

router.get('/', async (req, res) => {
  const cart = req.session.cart || [];
  const ids = cart.map(i => i.productId);
  let products = ids.length ? await Product.findAll({ where: { id: ids } }) : [];
  products = products.map(p => { productImage(p); return p; });
  const items = cart.map(c => {
    const p = products.find(pr => pr.id === c.productId);
    return { ...c, product: p };
  });
  const total = items.reduce((sum, i) => sum + (i.product ? parseFloat(i.product.price) * i.quantity : 0), 0);
  const error = req.session.cartError;
  req.session.cartError = null;
  res.render('cart/index', { title: 'Корзина', items, total, error });
});

router.post('/add/:id', async (req, res) => {
  const productId = parseInt(req.params.id);
  const quantity = parseInt(req.body.quantity) || 1;
  const product = await Product.findByPk(productId);
  if (!product || product.stock <= 0) {
    req.session.cartError = 'Товара нет в наличии';
    return res.redirect('/catalog');
  }
  if (!req.session.cart) req.session.cart = [];
  const existing = req.session.cart.find(i => i.productId === productId);
  const newQty = existing ? existing.quantity + quantity : quantity;
  if (newQty > product.stock) {
    req.session.cartError = 'Недостаточно товара на складе. Доступно: ' + product.stock + ' шт.';
    return res.redirect('/catalog/' + product.slug);
  }
  if (existing) {
    existing.quantity = newQty;
  } else {
    req.session.cart.push({ productId, quantity });
  }
  res.redirect('/cart');
});

router.post('/update/:productId', async (req, res) => {
  const productId = parseInt(req.params.productId);
  const quantity = parseInt(req.body.quantity);
  if (req.session.cart) {
    const item = req.session.cart.find(i => i.productId === productId);
    if (item) {
      if (quantity <= 0) {
        req.session.cart = req.session.cart.filter(i => i.productId !== productId);
      } else {
        const product = await Product.findByPk(productId);
        if (product && quantity > product.stock) {
          req.session.cartError = 'Недостаточно товара. Доступно: ' + product.stock + ' шт.';
          return res.redirect('/cart');
        }
        item.quantity = quantity;
      }
    }
  }
  res.redirect('/cart');
});

router.post('/remove/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(i => i.productId !== productId);
  }
  res.redirect('/cart');
});

module.exports = router;
