import express from "express";
// eslint-disable-next-line new-cap
const router = express.Router();
import jwt from "jsonwebtoken";
import qs from "qs";
import jwtMiddleware from "../lib/jwt.js";
import passport from "../lib/passport.js";
import { passport as passportConf, jwtSecret } from "../config.js";
import logger from "../lib/logger.js";

// Passport initialized here but actually used as passport.authenticate()
router.use(passport.initialize());

/**
 * @param {HTTPRequest} req
 * @return {String}
 */
function issueToken(req) {
  return jwt.sign(req.user, jwtSecret, {
    expiresIn: 60 * 60 * 24 * 180 /* 180 days */,
  });
}

// health check endpoint
router.get("/z", (req, res) => {
  res.sendStatus(200);
});

router.post(
  "/",
  passport.authenticate(passportConf.strategy, { session: false }),
  (req, res) => {
    if (req.user) {
      const parameters = {};
      parameters.token = issueToken(req);
      res.set({
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      });

      res.redirect(`/?${qs.stringify(parameters)}`);
      logger.trace(req.user);
    } else {
      res.sendStatus(401);
    }
  },
);

router.use(jwtMiddleware);

router.get("/", (req, res, next) => {
  res.sendFile("index.html", { root: "dist" });
});

export default router;
