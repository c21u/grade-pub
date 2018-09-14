const winston = require("winston");
const fs = require("fs");
const path = require("path");

const fileTransport = new winston.transports.File({
  level: "info",
  filename: path.join(__dirname, "../logs/server.log"),
  handleExceptions: true,
  json: true,
  maxsize: 5242880, // 5MB
  maxFiles: 7,
  colorize: false
});

// Make sure the logs directory exists
try {
  fs.mkdirSync("./logs", 0o755);
} catch (err) {
  // If the error was anything except the directory already existing there's a problem
  if (err.code !== "EEXIST") {
    throw new Error(err);
  }
}

let logger = winston.createLogger({
  transports: [fileTransport],
  exitOnError: false
});

logger.stream = {
  write: (message, encoding) => {
    logger.info(message);
  }
};

if (process.env.NODE_ENV === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: "info"
    })
  );
}

module.exports = logger;
