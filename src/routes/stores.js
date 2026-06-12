const { Router } = require('express');
const { Store } = require('../models');

const router = Router();

router.get('/', async (req, res) => {
  const stores = await Store.findAll({ order: [['name', 'ASC']] });
  res.render('stores/index', { title: 'Наши аптеки', stores });
});

module.exports = router;
