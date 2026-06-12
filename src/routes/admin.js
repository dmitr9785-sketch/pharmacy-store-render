const { Router } = require('express');
const { Product, Category, Store, Order, OrderItem, Promotion } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const { productImage } = require('../helpers');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

const router = Router();

router.use(requireAdmin);

router.get('/', (req, res) => {
  res.render('admin/index', { title: 'Админ-панель' });
});

router.get('/products', async (req, res) => {
  const products = (await Product.findAll({ include: [Category], order: [['name', 'ASC']] })).map(p => { productImage(p); return p; });
  res.render('admin/products', { title: 'Управление товарами', products });
});

router.get('/products/new', async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.render('admin/product-form', { title: 'Новый товар', product: null, categories });
});

router.post('/products', upload.single('image'), async (req, res) => {
  const data = req.body;
  const image = req.file ? req.file.filename : 'default-product.png';
  await Product.create({
    name: data.name,
    slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zа-я0-9-]/g, ''),
    description: data.description,
    manufacturer: data.manufacturer,
    activeIngredient: data.activeIngredient,
    dosage: data.dosage,
    form: data.form,
    requiresPrescription: data.requiresPrescription === 'on',
    price: data.price,
    stock: data.stock,
    categoryId: data.categoryId,
    image,
  });
  res.redirect('/admin/products');
});

router.get('/products/:id/edit', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  if (!product) return res.redirect('/admin/products');
  res.render('admin/product-form', { title: 'Редактировать товар', product, categories });
});

router.post('/products/:id', upload.single('image'), async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.redirect('/admin/products');
  const data = req.body;
  product.name = data.name;
  product.slug = data.slug || product.slug;
  product.description = data.description;
  product.manufacturer = data.manufacturer;
  product.activeIngredient = data.activeIngredient;
  product.dosage = data.dosage;
  product.form = data.form;
  product.requiresPrescription = data.requiresPrescription === 'on';
  product.price = data.price;
  product.stock = data.stock;
  product.categoryId = data.categoryId;
  if (req.file) product.image = req.file.filename;
  await product.save();
  res.redirect('/admin/products');
});

router.post('/products/:id/delete', async (req, res) => {
  await Product.destroy({ where: { id: req.params.id } });
  res.redirect('/admin/products');
});

router.get('/orders', async (req, res) => {
  const orders = await Order.findAll({
    include: [{ model: OrderItem, include: [Product] }],
    order: [['createdAt', 'DESC']],
  });
  res.render('admin/orders', { title: 'Заказы', orders });
});

router.post('/orders/:id/status', async (req, res) => {
  await Order.update({ status: req.body.status }, { where: { id: req.params.id } });
  res.redirect('/admin/orders');
});

router.get('/stores', async (req, res) => {
  const stores = await Store.findAll({ order: [['name', 'ASC']] });
  res.render('admin/stores', { title: 'Аптеки', stores });
});

router.post('/stores', async (req, res) => {
  const data = req.body;
  await Store.create({
    name: data.name, address: data.address,
    lat: data.lat, lng: data.lng,
    phone: data.phone, workingHours: data.workingHours,
  });
  res.redirect('/admin/stores');
});

router.post('/stores/:id/delete', async (req, res) => {
  await Store.destroy({ where: { id: req.params.id } });
  res.redirect('/admin/stores');
});

router.get('/promotions', async (req, res) => {
  const promotions = await Promotion.findAll({ order: [['sortOrder', 'ASC']], include: [{ association: 'category', attributes: ['name'] }] });
  res.render('admin/promotions', { title: 'Акции', promotions });
});

router.get('/promotions/new', async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.render('admin/promotion-form', { title: 'Новая акция', promotion: null, categories });
});

router.post('/promotions', async (req, res) => {
  const data = req.body;
  await Promotion.create({
    title: data.title,
    description: data.description,
    badgeText: data.badgeText,
    discountPercent: parseInt(data.discountPercent) || 0,
    requiresPromoCode: data.requiresPromoCode === 'on',
    promoCode: data.promoCode || null,
    requirements: data.requirements,
    isActive: data.isActive === 'on',
    sortOrder: parseInt(data.sortOrder) || 0,
    maxUses: parseInt(data.maxUses) || 0,
    applicableCategoryId: data.applicableCategoryId ? parseInt(data.applicableCategoryId) : null,
  });
  res.redirect('/admin/promotions');
});

router.get('/promotions/:id/edit', async (req, res) => {
  const promotion = await Promotion.findByPk(req.params.id);
  if (!promotion) return res.redirect('/admin/promotions');
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.render('admin/promotion-form', { title: 'Редактировать акцию', promotion, categories });
});

router.post('/promotions/:id', async (req, res) => {
  const promotion = await Promotion.findByPk(req.params.id);
  if (!promotion) return res.redirect('/admin/promotions');
  const data = req.body;
  promotion.title = data.title;
  promotion.description = data.description;
  promotion.badgeText = data.badgeText;
  promotion.discountPercent = parseInt(data.discountPercent) || 0;
  promotion.requiresPromoCode = data.requiresPromoCode === 'on';
  promotion.promoCode = data.promoCode || null;
  promotion.requirements = data.requirements;
  promotion.isActive = data.isActive === 'on';
  promotion.sortOrder = parseInt(data.sortOrder) || 0;
  promotion.maxUses = parseInt(data.maxUses) || 0;
  promotion.applicableCategoryId = data.applicableCategoryId ? parseInt(data.applicableCategoryId) : null;
  await promotion.save();
  res.redirect('/admin/promotions');
});

router.post('/promotions/:id/delete', async (req, res) => {
  await Promotion.destroy({ where: { id: req.params.id } });
  res.redirect('/admin/promotions');
});

module.exports = router;
