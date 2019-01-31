const bunyan = require("bunyan");
const level = require("../config").logLevel;

const logger = bunyan.createLogger({
  name: "grade-pub",
  serializers: {
    req: require("bunyan-express-serializer"),
    res: bunyan.stdSerializers.res,
    err: bunyan.stdSerializers.err
  },
  level,
  streams: [
    {
      stream: process.stdout
    }
  ]
});

module.exports = logger;
