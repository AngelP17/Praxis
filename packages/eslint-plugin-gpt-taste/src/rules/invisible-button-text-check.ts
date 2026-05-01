import { createRule, getClassNameValue } from "../utils";

export default createRule(
  {
    type: "problem",
    docs: {
      description:
        "Detect buttons with poor text/background contrast (dark-on-dark or light-on-light)",
      recommended: true,
    },
    schema: [],
    messages: {
      invisibleButtonText:
        "Button may have invisible text due to poor contrast: dark background ({{bg}}) with dark text ({{fg}}), or light background with light text.",
    },
  },
  (context) => {
    // Dark background classes
    const darkBgs = [
      "bg-black", "bg-zinc-900", "bg-zinc-800", "bg-gray-900", "bg-gray-800",
      "bg-slate-900", "bg-slate-800", "bg-neutral-900", "bg-neutral-800",
      "bg-stone-900", "bg-stone-800", "bg-red-900", "bg-orange-900",
      "bg-amber-900", "bg-green-900", "bg-emerald-900", "bg-teal-900",
      "bg-cyan-900", "bg-sky-900", "bg-blue-900", "bg-indigo-900",
      "bg-violet-900", "bg-purple-900", "bg-fuchsia-900", "bg-pink-900",
      "bg-rose-900",
    ];

    // Dark text classes
    const darkTexts = [
      "text-black", "text-zinc-900", "text-zinc-800", "text-zinc-700",
      "text-gray-900", "text-gray-800", "text-gray-700",
      "text-slate-900", "text-slate-800", "text-slate-700",
      "text-neutral-900", "text-neutral-800", "text-neutral-700",
      "text-stone-900", "text-stone-800", "text-stone-700",
    ];

    // Light background classes
    const lightBgs = [
      "bg-white", "bg-zinc-100", "bg-zinc-50", "bg-gray-100", "bg-gray-50",
      "bg-slate-100", "bg-slate-50", "bg-neutral-100", "bg-neutral-50",
      "bg-stone-100", "bg-stone-50",
    ];

    // Light text classes
    const lightTexts = [
      "text-white", "text-zinc-100", "text-zinc-200", "text-zinc-300",
      "text-gray-100", "text-gray-200", "text-gray-300",
      "text-slate-100", "text-slate-200", "text-slate-300",
      "text-neutral-100", "text-neutral-200", "text-neutral-300",
      "text-stone-100", "text-stone-200", "text-stone-300",
    ];

    function findMatchingClass(className: string, classList: string[]): string | null {
      const classes = className.split(/\s+/);
      for (const cls of classes) {
        if (classList.includes(cls)) return cls;
      }
      return null;
    }

    function isButtonLike(tagName: string | null): boolean {
      return tagName === "button" || tagName === "Button" || tagName === "a" || tagName === "A";
    }

    return {
      JSXOpeningElement(node: any) {
        const tagName = node.name?.type === "JSXIdentifier" ? node.name.name : null;
        if (!isButtonLike(tagName)) return;

        const className = getClassNameValue(node);
        if (!className) return;

        const darkBg = findMatchingClass(className, darkBgs);
        const darkText = findMatchingClass(className, darkTexts);
        const lightBg = findMatchingClass(className, lightBgs);
        const lightText = findMatchingClass(className, lightTexts);

        // Dark background + dark text = invisible
        if (darkBg && darkText) {
          context.report({
            node,
            messageId: "invisibleButtonText",
            data: { bg: darkBg, fg: darkText },
          });
        }

        // Light background + light text = invisible
        if (lightBg && lightText) {
          context.report({
            node,
            messageId: "invisibleButtonText",
            data: { bg: lightBg, fg: lightText },
          });
        }
      },
    };
  }
);
