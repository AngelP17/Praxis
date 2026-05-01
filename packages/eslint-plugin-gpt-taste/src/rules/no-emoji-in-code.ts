import { createRule, getStringValue } from "../utils";

export default createRule(
  {
    type: "problem",
    docs: {
      description:
        "Disallow emoji characters in JSX/TSX code to maintain professional formatting",
      recommended: true,
    },
    schema: [],
    messages: {
      noEmojiInCode:
        "Emoji '{{emoji}}' detected in code. Use @phosphor-icons/react or SVG icons instead of emojis.",
    },
  },
  (context) => {
    // Unicode emoji ranges
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}]|[\u{2B06}]|[\u{2B07}]|[\u{2B05}]|[\u{27A1}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{2934}-\u{2935}]|[\u{25AA}-\u{25AB}]|[\u{25FB}-\u{25FE}]|[\u{25FD}-\u{25FE}]|[\u{25FC}]|[\u{25B6}]|[\u{25C0}]|[\u{1F004}]|[\u{1F0CF}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{23E9}-\u{23EF}]|[\u{23F0}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{200D}]|[\u{FE0F}]|[\u{20E3}]|[\u{E0020}-\u{E007F}]/gu;

    function checkText(text: string, node: any) {
      const matches = text.match(emojiRegex);
      if (matches && matches.length > 0) {
        for (const emoji of matches) {
          context.report({
            node,
            messageId: "noEmojiInCode",
            data: { emoji },
          });
        }
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
