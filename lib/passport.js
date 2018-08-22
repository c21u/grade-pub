const passport = require('passport');
const PassportLTIStrategy = require('passport-lti');
const PassportLocalStrategy = require('passport-local');
const imsLTI = require('ims-lti');
const cfg = require('../config').auth;

const ltiStrategy = new PassportLTIStrategy({
  createProvider: (req, done) => {
    // TODO: implement going to some db to validate key/secret
    // const key = req.body.oauth_consumer_key;
    // if (key === 'valid') {
    //   return done(null, new imsLTI.Provider(key, db.get('secret')));
    // }
    const key = req.body.oauth_consumer_key;
    if (key === 'gatech') {
      return done(null, new imsLTI.Provider(key, 'supersecret'));
    }
    return done(null, false);
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
