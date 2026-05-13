/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["gpt-taste"],
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
  settings: {
    react: {
      version: "detect",
    },
  },
};
