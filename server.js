require("dotenv").config();
let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let httpLogger = require("morgan");
const logger = require("./lib/logger");
let sentryDSN = require("./config")["sentryDSN"];

if (sentryDSN) {
  let Sentry = require("@sentry/node");
  Sentry.init({ dsn: sentryDSN });
}

let indexRouter = require("./routes");
let apiRouter = require("./routes/api");

let app = express();

app.set("trust proxy", require("./config")["trustProxy"]);

if (sentryDSN) {
  app.use(Sentry.Handlers.requestHandler());
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  httpLogger(require("./config")["httpLogsFormat"], { stream: logger.stream })
);
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
