import { createRule, getClassNameValue, hasClass } from "../utils";

export default createRule(
  {
    type: "suggestion",
    docs: {
      description:
        "Require grid-flow-dense on grid layouts to prevent empty gaps in bento grids",
      recommended: true,
    },
    schema: [],
    messages: {
      missingGridFlowDense:
        "Grid layout is missing 'grid-flow-dense'. Add it to prevent empty gaps when using col-span/row-span.",
    },
  },
  (context) => {
    return {
      JSXOpeningElement(node: any) {
        const className = getClassNameValue(node);
        if (!className) return;

        // Check if it has a grid class but NOT grid-flow-dense
        const hasGrid = /\bgrid\b/.test(className);
        const hasGridCols = /\bgrid-cols-/.test(className);
        const hasDense = hasClass(className, "grid-flow-dense");

        // Only flag if it explicitly defines a grid layout
        if ((hasGrid && hasGridCols) && !hasDense) {
          context.report({
            node,
            messageId: "missingGridFlowDense",
          });
        }
      },
    };
  }
);
