let express = require('express');
// eslint-disable-next-line new-cap
let router = express.Router();
const passport = require('../lib/passport');
const authStrategy = require('../config').auth.strategy;

router.get(
  '/',
  (req, res, next) => {
    res.render('index', {title: 'Express'});
  }
);

router.use(passport.initialize());
router.post(
  '/',
  passport.authenticate(authStrategy, {session: false}),
  (req, res, next) => {
    if (req.user) {
      res.redirect('/secret');
    } else {
      res.sendStatus(401);
    }
  }
);

module.exports = router;
