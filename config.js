let getEnvVarOrDefault = (envVar, defaultValue) => {
  defaultValue = defaultValue || "CHANGEME";
  if (!!process.env[envVar]) {
    return process.env[envVar];
  } else {
    console.warn(`${envVar} not set: using default ${defaultValue}`);
    return defaultValue;
  }
};

let getEnvVarOrNull = envVar => {
  if (!!process.env[envVar]) {
    return process.env[envVar];
  } else {
    return null;
  }
};

let getEnvVarOrThrow = envVar => {
  if (!!process.env[envVar]) {
    return process.env[envVar];
  } else {
    throw new Error(`Unrecoverable: missing process.env.${envVar}`);
  }
};

let config = {};
try {
  config.buzzAPI = {
    appID: getEnvVarOrDefault("BUZZAPI_APP_ID"),
    password: getEnvVarOrDefault("BUZZAPI_PASSWORD")
  };
  config.lti = {
    key: getEnvVarOrThrow("LTI_KEY"),
    secret: getEnvVarOrThrow("LTI_SECRET")
  };
  config.canvasToken = getEnvVarOrDefault("CANVAS_TOKEN");
  config.jwtSecret = getEnvVarOrDefault("JWT_SECRET");
  config.fakeStrategyCredentials = {};
  config.passportStrategy = "lti";
  config.httpLogsFormat = "combined";
  config.sentryDSN = getEnvVarOrNull("SENTRY_DSN");
  config.trustProxy = getEnvVarOrDefault("TRUST_PROXY", "loopback");
} catch (err) {
  console.error(err);
}

if (process.env.NODE_ENV === "development") {
  config["httpLogsFormat"] = "dev";
}

if (process.env.NODE_ENV === "test") {
  console.warn(`Fake auth strategy enabled!`);
  config["passportStrategy"] = "fake";

  config["fakeStrategyCredentials"] = {
    username: getEnvVarOrDefault("FAKE_USERNAME"),
    password: getEnvVarOrDefault("FAKE_PASSWORD")
  };
}

module.exports = config;
