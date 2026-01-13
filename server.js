import "dotenv/config";
import createError from "http-errors";
import express from "express";
import { dirname, resolve } from "path";
import config from "./config.js";
import { fileURLToPath } from "url";
import { Provider as lti } from "ltijs";
import Database from "ltijs-sequelize";

import indexRouter from "./routes/index.js";
import apiRouter from "./routes/api.js";
import logger from "./lib/logger.js";

const app = express();

const db = new Database(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  dialect: "postgres",
  logging: false,
});

lti.setup(
  config.lti.key,
  {
    plugin: db,
  },
  {
    staticPath: "dist",
    cookies: {
      secure: true,
      sameSite: "None",
    },
    tokenMaxAge: false,
    devMode: false,
  },
);

const setup = async () => {
  const port = process.env.PORT || "3000";
  await lti.deploy({ port, silent: true });
  logger.info(
    {
      port,
      appRoute: lti.appRoute(),
      loginRoute: lti.loginRoute(),
      keys: lti.keysetRoute(),
    },
    "LTIjs is up",
  );

  /**
   * Register platform
   */
  await lti.registerPlatform(config.lti.platformConfig);
};

setup();

lti.app.set("trust proxy", config.trustProxy);

lti.whitelist("/z");

const __dirname = dirname(fileURLToPath(import.meta.url));
// view engine setup
lti.app.set("views", resolve(__dirname, "views"));
lti.app.set("view engine", "ejs");

lti.app.use(express.json({ limit: "10mb" }));
lti.app.use(express.urlencoded({ extended: false, limit: "10mb" }));
lti.app.use(express.static(resolve(__dirname, "dist")));

lti.app.use((req, res, next) => {
  res.setHeader("Cross-origin-Embedder-Policy", "credentialless");
  next();
});

lti.app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

lti.app.use("/", indexRouter);
lti.app.use("/api/", apiRouter);

// catch 404 and forward to error handler
lti.app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
lti.app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
