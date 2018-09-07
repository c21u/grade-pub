let expressJWT = require('express-jwt');
const cfg = require('../config').auth;

module.exports = expressJWT({
  secret: cfg.jwtSecret,
  credentialsRequired: true,
  getToken: (req) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) return req.headers.authorization.split(' ')[1];
    else if (req.query && req.query.token) return req.query.token;
    return null;
  },
});
