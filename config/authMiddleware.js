const passport = require('passport');

const isAuthorized = (req, res, next) => {
  return passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(403).json({ message: 'Not authenticated' });

    req.user = user;
    next();
  })(req, res, next);
}

const isClient = (req, res, next) => {
  return passport.authenticate('jwt-client', { session: false }, (err, client) => {
    if (err) return next(err);
    if (!client){
      res.json({ message: 'Not a client' });
    } else {
      req.user = client;
      next();
    }
  })(req, res, next);
}

const isAdmin = (req, res, next) => {
  return passport.authenticate('jwt', { session: false }, async (err, user) => {
    if (err) return next(err);
    user = await user;
    if (!user){
      res.json({ message: 'Not authenticated' });
    } else {
      if(user.admin === true){
        req.user = user;
        next();
      } else {
        res.json({ isAdmin: false });
      }
    }
  })(req, res, next);
}

module.exports = {
  isAuthorized,
  isClient,
  isAdmin
};
