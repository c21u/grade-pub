const expressJWT = require("express-jwt");

module.exports = expressJWT({
  secret: require("../config")["jwtSecret"],
  credentialsRequired: true,
  getToken: req => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
});
