import express from "express";
// eslint-disable-next-line new-cap
const router = express.Router();
import { umami } from "../config.js";
import logger from "../lib/logger.js";

// health check endpoint
router.get("/z", (req, res) => {
  res.sendStatus(200);
});

router.get("/lti", (req, res) => {
  res.render("index", { umami });
});

export default router;
