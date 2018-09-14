let config = {
  db: {
    connectionURI: 'postgres://localhost',
  },
  trustProxy: process.env.TRUST_PROXY || 'loopback',
  auth: {
    strategy: 'lti',
    jwtSecret: process.env.JWT_SECRET || 'CHANGE_ME',
  },
};

if (process.env.NODE_ENV === 'test') {
  config.auth.strategy = 'fake';

  // TODO complain if these are not set in Testing environment
  config.auth.fake = {
    username: process.env.FAKE_USERNAME,
    password: process.env.FAKE_PASSWORD,
  };
}

module.exports = config;
