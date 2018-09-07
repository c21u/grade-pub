let express = require('express');
// eslint-disable-next-line new-cap
let router = express.Router();
let jwtMiddleware = require('../lib/jwt');
let jwt = require('jsonwebtoken');
const passport = require('../lib/passport');
const cfg = require('../config').auth;

router.use(passport.initialize());
router.post(
  '/',
  passport.authenticate(cfg.strategy, {session: false}),
  (req, res, next) => {
    if (req.user) {
      const expiresIn = 60 * 60 * 24 * 180; // 180 days
      const token = jwt.sign(req.user, cfg.jwtSecret, {expiresIn});
      res.redirect(`/?token=${token}`);
    } else {
      res.sendStatus(401);
    }
  }
);

router.use(jwtMiddleware);

router.get(
  '/',
  (req, res, next) => {
    res.render('index', {title: 'Express'});
  }
);

module.exports = router;
