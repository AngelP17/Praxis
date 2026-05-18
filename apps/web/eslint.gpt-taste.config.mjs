import tsParser from "@typescript-eslint/parser";
import gptTaste from "eslint-plugin-gpt-taste";

export default [
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "gpt-taste": gptTaste,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "gpt-taste/no-meta-labels": "warn",
      "gpt-taste/no-narrow-hero-containers": "warn",
      "gpt-taste/require-grid-flow-dense": "warn",
      "gpt-taste/no-emoji-in-code": "warn",
      "gpt-taste/require-minimal-section-spacing": "warn",
      "gpt-taste/invisible-button-text-check": "warn",
      "gpt-taste/require-hover-physics": "warn",
      "gpt-taste/no-raw-hex": "warn",
    },
  },
];
