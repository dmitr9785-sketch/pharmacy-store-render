const { Router } = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const router = Router();

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Вход' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.render('auth/login', { title: 'Вход', error: 'Неверный email или пароль' });
  }
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points };
  res.redirect('/');
});

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Регистрация' });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.render('auth/register', { title: 'Регистрация', error: 'Email уже используется' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points };
  res.redirect('/');
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
