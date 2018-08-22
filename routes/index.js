let express = require('express');
// eslint-disable-next-line new-cap
let router = express.Router();
const passport = require('../passport');

router.get(
  '/',
  (req, res, next) => {
    res.render('index', {title: 'Express'});
  }
);

router.post(
  '/',
  passport.authenticate('lti', {session: false}),
  (req, res, next) => {
    res.redirect('/secret');
  }
);

module.exports = router;
