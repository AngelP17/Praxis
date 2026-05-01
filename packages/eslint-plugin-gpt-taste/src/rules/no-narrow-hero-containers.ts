import { createRule, getClassNameValue, hasClassMatching } from "../utils";

export default createRule(
  {
    type: "problem",
    docs: {
      description:
        "Disallow narrow containers (max-w-3xl or smaller) on H1 elements in hero sections",
      recommended: true,
    },
    schema: [],
    messages: {
      narrowHeroContainer:
        "Hero H1 container is too narrow ({{width}}). Use max-w-5xl, max-w-6xl, or w-full to keep headings to 2-3 lines.",
    },
  },
  (context) => {
    // Track ancestor containers to detect hero contexts
    // We look for H1 elements and check if any ancestor has a narrow max-w
    const narrowMaxWPattern = /^max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl)$/;
    const forbiddenWidths = ["max-w-xs", "max-w-sm", "max-w-md", "max-w-lg", "max-w-xl", "max-w-2xl", "max-w-3xl", "max-w-4xl"];

    return {
      JSXElement(node: any) {
        const opening = node.openingElement;
        if (!opening || opening.type !== "JSXOpeningElement") return;

        const tagName = opening.name?.type === "JSXIdentifier" ? opening.name.name : null;
        if (tagName !== "h1" && tagName !== "H1") return;

        // Walk up ancestors to find container with max-w class
        let current: any = node;
        while (current) {
          if (
            current.type === "JSXElement" &&
            current.openingElement &&
            current.openingElement.type === "JSXOpeningElement"
          ) {
            const className = getClassNameValue(current.openingElement);
            if (className) {
              const found = className.split(/\s+/).find((cls) => narrowMaxWPattern.test(cls));
              if (found) {
                context.report({
                  node: current.openingElement,
                  messageId: "narrowHeroContainer",
                  data: { width: found },
                });
                return;
              }
            }
          }
          current = current.parent;
        }
      },
    };
  }
);
