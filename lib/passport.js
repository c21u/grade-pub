const passport = require('passport');
const PassportLTIStrategy = require('passport-lti');
const PassportLocalStrategy = require('passport-local');
const imsLTI = require('ims-lti');
const cfg = require('../config').auth;
const LTISecret = require('../models/LTISecret');

const ltiStrategy = new PassportLTIStrategy({
  createProvider: (req, done) => {
    const key = req.body.oauth_consumer_key;
    LTISecret.findOne({
      attributes: ['secret'],
      where: {key},
    })
    .then((result) => {
      if (result) {
        return done(null, new imsLTI.Provider(key, result.get('secret')));
      } else {
        // createProvider expects failure-to-get-credentials-from-db case to
        // return with a single string, not a Passport verify signature
        done('Not authorized.');
      }
    })
    .catch((err) => done(err));
  },
}, (ltiContext, done) => done(null, ltiContext));

const fakeStrategy = new PassportLocalStrategy((username, password, done) => {
  if (
    username === cfg.fake.username
    && password === cfg.fake.password
  ) {
    return done(null, {});
  }
  return done(null, false);
});

const strategyToUse = require('../config').auth.strategy;
(strategyToUse === 'fake')
  ? passport.use('fake', fakeStrategy)
  : passport.use('lti', ltiStrategy);

module.exports = passport;
