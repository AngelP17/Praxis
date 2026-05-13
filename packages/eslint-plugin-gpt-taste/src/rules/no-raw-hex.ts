import { createRule, getElementName } from "../utils";

const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/;

/**
 * Walk a node looking for any string literal or template literal whose value
 * contains a raw hex color. Returns the offending node or null.
 */
function findHexInValue(node: any): any | null {
  if (!node) return null;

  if (node.type === "Literal" && typeof node.value === "string") {
    return HEX_PATTERN.test(node.value) ? node : null;
  }

  if (node.type === "TemplateLiteral") {
    for (const quasi of node.quasis) {
      if (quasi?.value && HEX_PATTERN.test(quasi.value.raw)) return node;
    }
    return null;
  }

  if (node.type === "BinaryExpression" && node.operator === "+") {
    return findHexInValue(node.left) || findHexInValue(node.right);
  }

  return null;
}

/**
 * Forbid raw hex colors (#RGB / #RRGGBB / #RRGGBBAA) anywhere in component code.
 * Tokens must live in apps/web/src/app/globals.css and be referenced as
 * `var(--praxis-*)`. This stops palette drift between components.
 */
export default createRule(
  {
    type: "problem",
    docs: {
      description:
        "Forbid raw hex color literals in components. Use var(--praxis-*) tokens from globals.css instead.",
      recommended: true,
    },
    schema: [],
    messages: {
      rawHex:
        "Raw hex color {{value}} is forbidden. Add a token to globals.css and use var(--praxis-*).",
    },
  },
  (context) => {
    function report(node: any, value: string) {
      const match = value.match(HEX_PATTERN);
      context.report({
        node,
        messageId: "rawHex",
        data: { value: match ? match[0] : value },
      });
    }

    return {
      // JSX style={{...}} object literals
      JSXAttribute(node: any) {
        if (!node.name || node.name.name !== "style") return;
        const expr = node.value?.expression;
        if (!expr || expr.type !== "ObjectExpression") return;

        for (const prop of expr.properties) {
          const offender = findHexInValue(prop.value);
          if (offender) {
            const raw =
              offender.type === "Literal"
                ? String(offender.value)
                : offender.type === "TemplateLiteral"
                ? offender.quasis.map((q: any) => q.value.raw).join("")
                : "";
            report(prop.value, raw);
          }
        }
      },

      // SVG color-ish attributes: fill, stroke, stopColor, color, stopOpacity-adjacent
      JSXOpeningElement(node: any) {
        const tag = getElementName(node);
        // Restrict the SVG color-attr scan to elements likely to carry color attrs.
        // The JSXAttribute hook above already covers style={{}} for everything.
        if (!tag) return;
        const colorAttrs = new Set([
          "fill",
          "stroke",
          "stopColor",
          "color",
          "floodColor",
          "lightingColor",
        ]);
        for (const attr of node.attributes) {
          if (
            attr.type !== "JSXAttribute" ||
            !attr.name ||
            attr.name.type !== "JSXIdentifier"
          )
            continue;
          if (!colorAttrs.has(attr.name.name)) continue;

          // attr.value can be a Literal string or JSXExpressionContainer
          const v = attr.value;
          if (!v) continue;
          if (v.type === "Literal" && typeof v.value === "string") {
            if (HEX_PATTERN.test(v.value)) report(v, v.value);
          } else if (v.type === "JSXExpressionContainer") {
            const offender = findHexInValue(v.expression);
            if (offender) {
              const raw =
                offender.type === "Literal"
                  ? String(offender.value)
                  : offender.type === "TemplateLiteral"
                  ? offender.quasis.map((q: any) => q.value.raw).join("")
                  : "";
              report(v, raw);
            }
          }
        }
      },

      // Top-level string constants and variable declarations
      VariableDeclarator(node: any) {
        const offender = findHexInValue(node.init);
        if (offender) {
          const raw =
            offender.type === "Literal"
              ? String(offender.value)
              : offender.type === "TemplateLiteral"
              ? offender.quasis.map((q: any) => q.value.raw).join("")
              : "";
          report(node.init, raw);
        }
      },
    };
  }
);
