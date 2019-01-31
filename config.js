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
  config.canvasToken = getEnvVarOrDefault("CANVAS_TOKEN");
  config.fakeStrategyCredentials = {};
  config.googleAnalyticsTrackingID = getEnvVarOrNull("GOOGLE_TRACKING_ID");
  config.jwtSecret = getEnvVarOrDefault("JWT_SECRET");
  config.lti = {
    key: getEnvVarOrThrow("LTI_KEY"),
    secret: getEnvVarOrThrow("LTI_SECRET")
  };
  config.passportStrategy = "lti";
  config.sentryDSN = getEnvVarOrNull("SENTRY_DSN");
  config.trustProxy = getEnvVarOrDefault("TRUST_PROXY", "loopback");
  config.logLevel = getEnvVarOrDefault("LOG_LEVEL", "info");
} catch (err) {
  console.error(err);
}

if (process.env.NODE_ENV === "test") {
  console.warn(`Fake auth strategy enabled!`);
  config["fakeStrategyCredentials"] = {
    username: getEnvVarOrDefault("FAKE_USERNAME"),
    password: getEnvVarOrDefault("FAKE_PASSWORD")
  };
  config["passportStrategy"] = "fake";
  config.logLevel = getEnvVarOrDefault("LOG_LEVEL", "error");
}

module.exports = config;
