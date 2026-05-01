import { createRule, getClassNameValue } from "../utils";

export default createRule(
  {
    type: "suggestion",
    docs: {
      description:
        "Require hover physics (hover:scale, group-hover, or transition classes) on interactive card and link elements",
      recommended: true,
    },
    schema: [],
    messages: {
      missingHoverPhysics:
        "Interactive element '{{tag}}' is missing hover physics. Add hover:scale-105, group-hover:scale-105, transition-transform, or similar motion classes.",
    },
  },
  (context) => {
    const hoverPatterns = [
      /hover:scale-/,
      /group-hover:scale-/,
      /hover:-translate/,
      /group-hover:-translate/,
      /transition-transform/,
      /transition-all/,
      /motion-/,
      /animate-/,
      /whileHover/,
      /whileTap/,
    ];

    function hasHoverPhysics(className: string | null): boolean {
      if (!className) return false;
      return className.split(/\s+/).some((cls) =>
        hoverPatterns.some((pattern) => pattern.test(cls))
      );
    }

    function isInteractiveCardOrLink(tagName: string | null, className: string | null): boolean {
      if (!tagName) return false;

      // Links
      if (tagName === "a" || tagName === "Link" || tagName === "NextLink") return true;

      // Buttons
      if (tagName === "button" || tagName === "Button") return true;

      // Cards: div/section/article with cursor-pointer or specific card classes
      if (className) {
        const isCardLike =
          /\bcard\b/.test(className) ||
          /\bcursor-pointer\b/.test(className) ||
          /\bclickable\b/.test(className);
        if (isCardLike) return true;
      }

      return false;
    }

    return {
      JSXOpeningElement(node: any) {
        const tagName = node.name?.type === "JSXIdentifier" ? node.name.name : null;
        const className = getClassNameValue(node);

        if (!isInteractiveCardOrLink(tagName, className)) return;
        if (hasHoverPhysics(className)) return;

        context.report({
          node,
          messageId: "missingHoverPhysics",
          data: { tag: tagName || "element" },
        });
      },
    };
  }
);
