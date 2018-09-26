let express = require("express");
// eslint-disable-next-line new-cap
let router = express.Router();
let jwtMiddleware = require("../lib/jwt");

router.use(jwtMiddleware);

router.get("/", (req, res, next) => {
  res.render("index", { title: "Express - api" });
});

router.get("/demo", (req, res, next) => {
  res.send({ demo: "some demo json" });
});

module.exports = router;
