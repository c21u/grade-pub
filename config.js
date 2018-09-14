let getEnvVarOrDefault = (envVar, defaultValue) => {
  defaultValue = defaultValue || "CHANGEME";
  if (!!process.env[envVar]) {
    return process.env[envVar];
  } else {
    console.warn(`${envVar} not set: using default ${defaultValue}`);
    return defaultValue;
  }
};

let config = {
  auth: {
    jwtSecret: getEnvVarOrDefault("JWT_SECRET"),
    strategy: "lti"
  },
  database: {
    url: getEnvVarOrDefault("DATABASE_URL", "postgres://localhost")
  },
  httpLogsFormat: "combined",
  trustProxy: getEnvVarOrDefault("TRUST_PROXY", "loopback")
};

if (process.env.NODE_ENV === "development") {
  config["httpLogsFormat"] = "dev";
}

if (process.env.NODE_ENV === 'test') {
  console.warn(`Fake auth strategy enabled!`);
  config["auth"]["strategy"] = "fake";

  config.auth.fake = {
    username: process.env.FAKE_USERNAME,
    password: process.env.FAKE_PASSWORD,
  };
}

module.exports = config;
