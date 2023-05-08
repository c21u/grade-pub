require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("./lib/logger");
const sentryDSN = require("./config")["sentryDSN"];

const Sentry = require("@sentry/node");
if (sentryDSN) {
  Sentry.init({ dsn: sentryDSN });
}

const indexRouter = require("./routes");
const apiRouter = require("./routes/api");

const app = express();

app.set("trust proxy", require("./config")["trustProxy"]);

if (sentryDSN) {
  app.use(Sentry.Handlers.requestHandler());
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Log requests
app.use((req, res, next) => {
  const log = logger.child(
    {
      id: req.id,
      body: req.body
    },
    true
  );
  log.info({
    req
  });
  next();
});

// Log responses
app.use(function(req, res, next) {
  /**
   * Function to cleanup and log the response
   **/
  function afterResponse() {
    res.removeListener("finish", afterResponse);
    res.removeListener("close", afterResponse);
    const log = logger.child(
      {
        id: req.id
      },
      true
    );
    log.info({ res: res }, "response");
  }
  res.on("finish", afterResponse);
  res.on("close", afterResponse);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "dist")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/", indexRouter);
app.use("/api/", apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

if (sentryDSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
