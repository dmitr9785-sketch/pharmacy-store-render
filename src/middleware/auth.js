function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('403', { title: 'Доступ запрещён' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
