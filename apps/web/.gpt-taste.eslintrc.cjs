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
    // Phase 2: All rules hardened to errors (block merges)
    "gpt-taste/no-meta-labels": "error",
    "gpt-taste/no-narrow-hero-containers": "error",
    "gpt-taste/require-grid-flow-dense": "error",
    "gpt-taste/no-emoji-in-code": "error",
    "gpt-taste/require-minimal-section-spacing": "error",
    "gpt-taste/invisible-button-text-check": "error",
    "gpt-taste/require-hover-physics": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
