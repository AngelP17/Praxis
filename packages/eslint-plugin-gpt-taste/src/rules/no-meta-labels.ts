import { createRule, getStringValue } from "../utils";

export default createRule(
  {
    type: "problem",
    docs: {
      description:
        "Disallow cheap meta-labels like 'SECTION 01', 'QUESTION 05', 'ABOUT US' in JSX",
      recommended: true,
    },
    schema: [],
    messages: {
      noMetaLabel:
        "Cheap meta-label '{{label}}' detected. Remove meta-labels like 'SECTION 01', 'QUESTION 05', 'ABOUT US'. They look unprofessional.",
    },
  },
  (context) => {
    // Patterns for cheap meta-labels:
    // - SECTION/QUESTION/STEP/CHAPTER + number
    // - All-caps short labels like ABOUT US, CONTACT US, OUR TEAM
    const metaLabelRegex = /^(SECTION|QUESTION|STEP|CHAPTER|PART|FAQ)\s*\d+$/i;
    const genericCapsRegex = /^(ABOUT\s+US|CONTACT\s+US|OUR\s+TEAM|OUR\s+SERVICES|GET\s+IN\s+TOUCH)$/i;

    function checkText(text: string, node: any) {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (metaLabelRegex.test(trimmed) || genericCapsRegex.test(trimmed)) {
        context.report({
          node,
          messageId: "noMetaLabel",
          data: { label: trimmed },
        });
      }
    }

    return {
      JSXText(node: any) {
        checkText(node.value, node);
      },
      Literal(node: any) {
        if (typeof node.value === "string") {
          checkText(node.value, node);
        }
      },
      TemplateLiteral(node: any) {
        for (const quasi of node.quasis) {
          checkText(quasi.value.raw, quasi);
        }
      },
    };
  }
);
