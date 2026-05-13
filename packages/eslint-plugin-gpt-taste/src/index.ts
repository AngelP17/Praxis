import noMetaLabels from "./rules/no-meta-labels";
import noNarrowHeroContainers from "./rules/no-narrow-hero-containers";
import requireGridFlowDense from "./rules/require-grid-flow-dense";
import noEmojiInCode from "./rules/no-emoji-in-code";
import requireMinimalSectionSpacing from "./rules/require-minimal-section-spacing";
import invisibleButtonTextCheck from "./rules/invisible-button-text-check";
import requireHoverPhysics from "./rules/require-hover-physics";
import noRawHex from "./rules/no-raw-hex";

const plugin = {
  meta: {
    name: "eslint-plugin-gpt-taste",
    version: "1.1.0",
  },
  rules: {
    "no-meta-labels": noMetaLabels,
    "no-narrow-hero-containers": noNarrowHeroContainers,
    "require-grid-flow-dense": requireGridFlowDense,
    "no-emoji-in-code": noEmojiInCode,
    "require-minimal-section-spacing": requireMinimalSectionSpacing,
    "invisible-button-text-check": invisibleButtonTextCheck,
    "require-hover-physics": requireHoverPhysics,
    "no-raw-hex": noRawHex,
  },
  configs: {
    recommended: {
      plugins: ["gpt-taste"],
      rules: {
        "gpt-taste/no-meta-labels": "error",
        "gpt-taste/no-narrow-hero-containers": "error",
        "gpt-taste/require-grid-flow-dense": "warn",
        "gpt-taste/no-emoji-in-code": "error",
        "gpt-taste/require-minimal-section-spacing": "warn",
        "gpt-taste/invisible-button-text-check": "error",
        "gpt-taste/require-hover-physics": "warn",
        "gpt-taste/no-raw-hex": "warn",
      },
    },
    strict: {
      plugins: ["gpt-taste"],
      rules: {
        "gpt-taste/no-meta-labels": "error",
        "gpt-taste/no-narrow-hero-containers": "error",
        "gpt-taste/require-grid-flow-dense": "error",
        "gpt-taste/no-emoji-in-code": "error",
        "gpt-taste/require-minimal-section-spacing": "error",
        "gpt-taste/invisible-button-text-check": "error",
        "gpt-taste/require-hover-physics": "error",
        "gpt-taste/no-raw-hex": "error",
      },
    },
  },
};

export = plugin;
