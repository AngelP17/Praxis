import { createRule, getClassNameValue, hasClassMatching } from "../utils";

export default createRule(
  {
    type: "suggestion",
    docs: {
      description:
        "Require sufficient vertical padding (py-20 or larger) on major section elements",
      recommended: true,
    },
    schema: [],
    messages: {
      insufficientSectionSpacing:
        "Section has insufficient vertical padding ({{padding}}). Use py-20, py-24, py-32, or larger for cinematic spacing between sections.",
    },
  },
  (context) => {
    // Minimum acceptable padding values in Tailwind
    const validPaddingPattern = /^py-(20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/;
    const paddingPattern = /\bpy-(\d+)\b/g;

    return {
      JSXOpeningElement(node: any) {
        const tagName = node.name?.type === "JSXIdentifier" ? node.name.name : null;
        if (tagName !== "section" && tagName !== "SECTION") return;

        const className = getClassNameValue(node);
        if (!className) {
          // No className at all - report
          context.report({
            node,
            messageId: "insufficientSectionSpacing",
            data: { padding: "none" },
          });
          return;
        }

        const hasValidPadding = hasClassMatching(className, (cls) =>
          validPaddingPattern.test(cls)
        );

        if (!hasValidPadding) {
          // Extract any py-* value found for the error message
          const matches = className.match(paddingPattern);
          const paddingValue = matches ? matches.join(", ") : "none or too small";

          context.report({
            node,
            messageId: "insufficientSectionSpacing",
            data: { padding: paddingValue },
          });
        }
      },
    };
  }
);
