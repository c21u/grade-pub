module.exports = {
  extends: [
    "google",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: true,
  },
  ignorePatterns: ["dist"],
  plugins: ["react", "react-hooks"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2023,
    sourceType: "module",
  },
  root: true,
  rules: {
    "no-undef": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
