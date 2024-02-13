import bunyan from "bunyan";
import bunyanExpressSerializer from "bunyan-express-serializer";
import { logLevel as level } from "../config.js";

export default bunyan.createLogger({
  name: "grade-pub",
  serializers: {
    req: bunyanExpressSerializer,
    res: bunyan.stdSerializers.res,
    err: bunyan.stdSerializers.err,
  },
  level,
  streams: [
    {
      stream: process.stdout,
    },
  ],
});
