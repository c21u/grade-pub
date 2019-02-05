const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtMiddleware = require("../lib/jwt");
const passport = require("../lib/passport");

// Passport initialized here but actually used as passport.authenticate()
router.use(passport.initialize());
const passportStrategy = require("../config")["passportStrategy"];

// health check endpoint
router.get("/z", (req, res, next) => {
  res.sendStatus(200);
});

router.post(
  "/",
  passport.authenticate(passportStrategy, { session: false }),
  (req, res, next) => {
    if (req.user) {
      const jwtSecret = require("../config")["jwtSecret"];
      const expiresIn = 60 * 60 * 24 * 180; // 180 days
      const token = jwt.sign(req.user, jwtSecret, { expiresIn });
      res.redirect(`/?token=${token}`);
    } else {
      res.sendStatus(401);
    }
  }
);

router.use(jwtMiddleware);

router.get("/", (req, res, next) => {
  res.sendFile("index.html", { root: "dist" });
});

module.exports = router;
