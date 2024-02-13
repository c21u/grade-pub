import { expressjwt } from "express-jwt";
import { jwtSecret as secret } from "../config.js";

export default expressjwt({
  algorithms: ["HS256"],
  secret,
  credentialsRequired: true,
  getToken: (req) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  },
});
