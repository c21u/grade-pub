const getEnvVarOrDefault = (envVar, defaultValue) => {
  defaultValue = defaultValue || "CHANGEME";
  if (!!process.env[envVar]) {
    return process.env[envVar];
  } else {
    console.warn(`${envVar} not set: using default ${defaultValue}`);
    return defaultValue;
  }
};

const getEnvVarOrNull = (envVar) => {
  if (!!process.env[envVar]) {
    return process.env[envVar];
  } else {
    return null;
  }
};

const getEnvVarOrThrow = (envVar) => {
  if (!!process.env[envVar]) {
    return process.env[envVar];
  } else {
    throw new Error(`Unrecoverable: missing process.env.${envVar}`);
  }
};

export const buzzAPI = {
  apiUser: getEnvVarOrThrow("BUZZAPI_APP_ID"),
  apiPassword: getEnvVarOrThrow("BUZZAPI_PASSWORD"),
};

export const canvasToken = getEnvVarOrThrow("CANVAS_TOKEN");
export const jwtSecret = getEnvVarOrDefault("JWT_SECRET", "secret");
export const lti = {
  key: getEnvVarOrThrow("LTI_KEY"),
  secret: getEnvVarOrThrow("LTI_SECRET"),
};
export const trustProxy = getEnvVarOrDefault("TRUST_PROXY", "loopback");

const defaultLogLevel = process.env.NODE_ENV === "test" ? "error" : "info";
export const logLevel = getEnvVarOrDefault("LOG_LEVEL", defaultLogLevel);

if (process.env.NODE_ENV === "test") {
  console.warn(`Fake auth strategy enabled!`);
}
export const passport = {
  strategy: process.env.NODE_ENV === "test" ? "fake" : "lti",
  ...(process.env.NODE_ENV === "test"
    ? {
        fakeStrategyCredentials: {
          username: getEnvVarOrDefault("FAKE_USERNAME"),
          password: getEnvVarOrDefault("FAKE_PASSWORD"),
        },
      }
    : null),
};

export const banner = {
  url: getEnvVarOrThrow("BANNER_GRADE_API_URL"),
  token: getEnvVarOrThrow("BANNER_GRADE_API_TOKEN"),
};

export const namespace = getEnvVarOrDefault(
  "NAMESPACE",
  "edu.gatech.eduapps.gradepubdev",
);

export const umami = {
  url: getEnvVarOrDefault(
    "UMAMI_URL",
    "https://analytics.eduapps.gatech.edu/script.js",
  ),
  id: getEnvVarOrDefault("UMAMI_ID", ""),
};

export const alwaysSendCurrentGrade = getEnvVarOrNull(
  "ALWAYS_SEND_CURRENT_GRADE",
);

const config = {
  buzzAPI,
  canvasToken,
  jwtSecret,
  lti,
  trustProxy,
  logLevel,
  passport,
  banner,
  namespace,
  umami,
  alwaysSendCurrentGrade,
};

export default config;
