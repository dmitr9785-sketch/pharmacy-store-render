const express = require('express');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { sequelize } = require('./src/models');
const { startOrderUpdater } = require('./src/orderUpdater');

const SequelizeStore = require('connect-session-sequelize')(session.Store);

const authRoutes = require('./src/routes/auth');
const catalogRoutes = require('./src/routes/catalog');
const cartRoutes = require('./src/routes/cart');
const checkoutRoutes = require('./src/routes/checkout');
const storesRoutes = require('./src/routes/stores');
const aboutRoutes = require('./src/routes/about');
const adminRoutes = require('./src/routes/admin');
const profileRoutes = require('./src/routes/profile');
const reviewsRoutes = require('./src/routes/reviews');
const promotionsRoutes = require('./src/routes/promotions');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const sessionStore = new SequelizeStore({ db: sequelize });

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.cartCount = req.session.cart ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  next();
});

app.use('/', catalogRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/stores', storesRoutes);
app.use('/about', aboutRoutes);
app.use('/admin', adminRoutes);
app.use('/profile', profileRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/promotions', promotionsRoutes);

app.get('/debug', (req, res) => {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const masked = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\/\/.*@/, '//***@') : 'не задан';
  res.json({
    DATABASE_URL: hasDbUrl, maskedUrl: masked, PORT: process.env.PORT, node: process.version,
    hasSessionSecret: !!process.env.SESSION_SECRET,
  });
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Страница не найдена' });
});

const PORT = process.env.PORT || 3000;

async function start() {
  let retries = 10;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('✓ База данных подключена');
      break;
    } catch (err) {
      retries--;
      console.log(`⏳ База не готова, осталось попыток: ${retries}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  if (retries === 0) {
    console.error('Не удалось подключиться к БД после 10 попыток');
    process.exit(1);
  }

  await sequelize.sync({ alter: true });
  await sessionStore.sync();
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
  startOrderUpdater();
}

start().catch(err => {
  console.error('Ошибка при запуске:', err);
  process.exit(1);
});
