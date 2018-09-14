let config = {
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    strategy: "lti"
  },
  database: {
    url: process.env.DATABASE_URL || "postgres://localhost"
  },
  httpLogsFormat: "combined",
  trustProxy: process.env.TRUST_PROXY || "loopback"
};

if (process.env.NODE_ENV === "development") {
  config.httpLogsFormat = "dev";
}

if (process.env.NODE_ENV === 'test') {
  config.auth.strategy = 'fake';

  config.auth.fake = {
    username: process.env.FAKE_USERNAME,
    password: process.env.FAKE_PASSWORD,
  };
}

module.exports = config;
