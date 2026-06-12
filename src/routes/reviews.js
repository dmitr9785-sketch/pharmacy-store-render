const { Router } = require('express');
const { Review, Product } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/:productId', async (req, res) => {
  const productId = parseInt(req.params.productId);
  const { rating, text } = req.body;
  const product = await Product.findByPk(productId);
  if (!product) return res.status(404).render('404', { title: 'Не найдено' });

  const authorName = req.session.user ? req.session.user.name : 'Аноним';
  const userId = req.session.user ? req.session.user.id : null;

  await Review.create({
    productId,
    userId,
    authorName,
    rating: parseInt(rating) || 5,
    text: (text || '').substring(0, 200),
  });

  const result = await Review.findAll({
    where: { productId },
    attributes: ['rating'],
  });
  const avg = result.reduce((s, r) => s + r.rating, 0) / result.length;
  const newRating = Math.max(2.5, Math.min(5.0, Math.round(avg * 10) / 10));
  await product.update({ rating: newRating });

  res.redirect('/catalog/' + product.slug + '#reviews');
});

router.post('/:id/delete', requireAuth, async (req, res) => {
  const review = await Review.findByPk(parseInt(req.params.id));
  if (!review) return res.status(404).render('404', { title: 'Не найдено' });

  const isOwner = review.userId && review.userId === req.session.user.id;
  const isAdmin = req.session.user.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).send('Нет доступа');

  const product = await Product.findByPk(review.productId);

  await review.destroy();

  // Пересчитать рейтинг
  const result = await Review.findAll({
    where: { productId: review.productId },
    attributes: ['rating'],
  });
  if (result.length > 0) {
    const avg = result.reduce((s, r) => s + r.rating, 0) / result.length;
    const newRating = Math.max(2.5, Math.min(5.0, Math.round(avg * 10) / 10));
    await product.update({ rating: newRating });
  } else {
    await product.update({ rating: 4.0 });
  }

  res.redirect('/catalog/' + product.slug + '#reviews');
});

module.exports = router;
