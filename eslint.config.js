import prettierPlugin from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import * as reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import eslint from "@eslint/js";

export default [
  {
    ...eslint.configs.recommended,
    files: ["**/*.js"],
    ignores: ["dist/*"],
    rules: {
      "no-undef": "error",
    },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["server/**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    files: ["e2e/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
        cy: true,
        Cypress: true,
      },
    },
  },
  {
    files: ["client/**/*.{js,jsx}"],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat["jsx-runtime"],
    ...reactHooks.configs["recommeded-latest"],
    plugins: { react: reactPlugin },
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
  },
  prettierPlugin,
];
