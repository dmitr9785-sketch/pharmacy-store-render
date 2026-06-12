const { Router } = require('express');
const { Product, Category, Store, Review } = require('../models');
const { productImage } = require('../helpers');
const qs = require('querystring');

const router = Router();

router.get('/', async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  const products = (await Product.findAll({
    include: [Category],
    order: [['createdAt', 'DESC']],
    limit: 8,
  })).map(p => { productImage(p); return p; });
  const stores = await Store.findAll({ order: [['name', 'ASC']] });
  res.render('index', { title: 'Главная', categories, products, stores });
});

router.get('/catalog', async (req, res) => {
  const { category, prescription, search, page } = req.query;
  const where = {};
  if (category) where.categoryId = category;
  if (prescription === 'otc') where.requiresPrescription = false;
  if (prescription === 'rx') where.requiresPrescription = true;
  if (search) where.name = { [require('sequelize').Op.iLike]: `%${search}%` };

  const limit = 12;
  const currentPage = Math.max(1, parseInt(page) || 1);
  const offset = (currentPage - 1) * limit;

  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  const { count, rows: products } = await Product.findAndCountAll({
    where,
    include: [Category],
    order: [['name', 'ASC']],
    limit,
    offset,
  });
  products.forEach(p => productImage(p));

  const totalPages = Math.ceil(count / limit);

  res.render('catalog/index', { title: 'Каталог', categories, products, query: req.query, currentPage, totalPages, totalProducts: count, qs });
});

router.get('/catalog/:slug', async (req, res) => {
  const product = await Product.findOne({
    where: { slug: req.params.slug },
    include: [Category],
  });
  if (!product) return res.status(404).render('404', { title: 'Не найдено' });

  productImage(product);

  const reviews = await Review.findAll({
    where: { productId: product.id },
    order: [['createdAt', 'DESC']],
  });

  const related = (await Product.findAll({
    where: { categoryId: product.categoryId, id: { [require('sequelize').Op.ne]: product.id } },
    limit: 4,
  })).map(p => { productImage(p); return p; });
  res.render('catalog/show', { title: product.name, product, related, reviews });
});

module.exports = router;
