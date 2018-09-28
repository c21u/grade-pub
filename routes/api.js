let express = require("express");
// eslint-disable-next-line new-cap
let router = express.Router();
let jwtMiddleware = require("../lib/jwt");
let canvasAPI = require("../lib/canvas");

router.use(jwtMiddleware);

router.get("/", (req, res, next) => {
  res.render("index", { title: "Express - api" });
});

router.get("/demo", (req, res, next) => {
  let canvas = canvasAPI.getCanvasContext(req);

  canvas.api
    .get(`courses/${canvas.courseID}/enrollments`)
    .then(result => {
      console.info(`got result`);
      res.send({ result });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

module.exports = router;
