let config = {
  trustProxy: process.env.TRUST_PROXY || 'loopback',
  auth: {
    strategy: 'lti',
  },
};

if (process.env.NODE_ENV === 'testing') {
  config.auth.strategy = 'fake';

  // TODO complain if these are not set in Testing environment
  config.auth.fake = {
    username: process.env.FAKE_USERNAME,
    password: process.env.FAKE_PASSWORD,
  };
}

module.exports = config;
