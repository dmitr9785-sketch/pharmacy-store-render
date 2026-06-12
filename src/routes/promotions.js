const { Router } = require('express');
const { Promotion } = require('../models');

const router = Router();

router.get('/', async (req, res) => {
  const promotions = await Promotion.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC']],
  });
  res.render('promotions/index', { title: 'Акции', promotions });
});

module.exports = router;
