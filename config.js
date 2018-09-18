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
  buzzAPI: {
    appID: getEnvVarOrDefault("BUZZAPI_APP_ID"),
    password: getEnvVarOrDefault("BUZZAPI_PASSWORD")
  },
  canvas: {
    token: getEnvVarOrDefault("CANVAS_TOKEN"),
    url: getEnvVarOrDefault("CANVAS_URL")
  },
  clientURL: "/",
  jwtSecret: getEnvVarOrDefault("JWT_SECRET"),
  fakeStrategyCredentials: {},
  passportStrategy: "lti",
  databaseURL: getEnvVarOrDefault("DATABASE_URL", "postgres://localhost"),
  httpLogsFormat: "combined",
  trustProxy: getEnvVarOrDefault("TRUST_PROXY", "loopback")
};

if (process.env.NODE_ENV === "development") {
  config["httpLogsFormat"] = "dev";
  config["clientURL"] = getEnvVarOrDefault("CLIENT_URL", "/");
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
