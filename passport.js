const passport = require('passport');
const PassportLTIStrategy = require('passport-lti');
const imsLTI = require('ims-lti');

const ltiStrategy = new PassportLTIStrategy({
  createProvider: (req, done) => {
    // TODO: implement going to some db to validate key/secret
    // const key = req.body.oauth_consumer_key;
    // if (key === 'valid') {
    //   return done(null, new imsLTI.Provider(key, db.get('secret')));
    // }
    return done(null, false);
  },
}, (ltiContext, done) => done(null, ltiContext));

passport.use('lti', ltiStrategy);

module.exports = passport;
