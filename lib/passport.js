import passport from "passport";
import PassportLTIStrategy from "passport-lti";
import PassportLocalStrategy from "passport-local";
import imsLTI from "ims-lti";
import { passport as passportConf, lti } from "../config.js";
const fakeAuth = passportConf.fakeStrategyCredentials;

passportConf.strategy === "fake"
  ? passport.use(
      "fake",
      new PassportLocalStrategy((username, password, done) => {
        if (username === fakeAuth.username && password === fakeAuth.password) {
          return done(null, {});
        }
        return done(null, false);
      }),
    )
  : passport.use(
      "lti",
      new PassportLTIStrategy(
        {
          createProvider: (req, done) => {
            const key = req.body.oauth_consumer_key;
            if (key === lti.key) {
              return done(null, new imsLTI.Provider(key, lti.secret));
            } else {
              // createProvider expects failure-to-lookup-credentials case to
              // return with a single string, not a Passport verify signature
              done("Not authorized.");
            }
          },
        },
        (ltiContext, done) => done(null, ltiContext),
      ),
    );

export default passport;
