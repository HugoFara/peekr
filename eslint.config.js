import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/indent': ['error', 2],
    }
  },
  { files: ["src/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["src/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
]);
