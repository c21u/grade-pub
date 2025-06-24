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

export const lti = {
  key: getEnvVarOrThrow("LTI_KEY"),
  platformConfig: {
    name: getEnvVarOrDefault("LTI_PLATFORM_NAME", "GATECH"),
    url: getEnvVarOrDefault("LTI_URL", "https://canvas.test.instructure.com"),
    clientId: getEnvVarOrThrow("CLIENT_ID"),
    authenticationEndpoint: getEnvVarOrDefault(
      "LTI_AUTHN_ENDPOINT",
      "https://sso.test.canvaslms.com/api/lti/authorize_redirect",
    ),
    accesstokenEndpoint: getEnvVarOrDefault(
      "LTI_TOKEN_ENDPOINT",
      "https://sso.test.canvaslms.com/login/oauth2/token",
    ),
    authConfig: {
      method: "JWK_SET",
      key: getEnvVarOrDefault(
        "LTI_KEYS_URL",
        "https://sso.test.canvaslms.com/api/lti/security/jwks",
      ),
    },
  },
};

export const trustProxy = getEnvVarOrDefault("TRUST_PROXY", "loopback");

const defaultLogLevel = process.env.NODE_ENV === "test" ? "error" : "info";
export const logLevel = getEnvVarOrDefault("LOG_LEVEL", defaultLogLevel);

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

export const db = {
  host: getEnvVarOrDefault("DB_HOST", "db"),
  port: getEnvVarOrDefault("DB_PORT", 5432),
  user: getEnvVarOrDefault("DB_USER", "gradepub"),
  database: getEnvVarOrDefault("DB_NAME", "gradepub"),
  password: getEnvVarOrDefault("DB_PASS", "gradepub_access"),
};

export const alwaysSendCurrentGrade = getEnvVarOrNull(
  "ALWAYS_SEND_CURRENT_GRADE",
);

const config = {
  buzzAPI,
  canvasToken,
  lti,
  trustProxy,
  logLevel,
  banner,
  namespace,
  umami,
  db,
  alwaysSendCurrentGrade,
};

export default config;
