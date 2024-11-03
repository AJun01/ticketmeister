export function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
      if (req.session.user.language) {
        req.setLocale(req.session.user.language);
      }
      return next();
    } else {
      res.redirect('/login');
    }
  }