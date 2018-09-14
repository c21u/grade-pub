module.exports = {
  extends: [
    "google",
    "plugin:react/recommended",
    "plugin:prettier/recommended"
  ],
  env: {
    es6: true,
    node: true,
    browser: true
  },
  plugins: ["react"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    sourceType: "module"
  }
};
