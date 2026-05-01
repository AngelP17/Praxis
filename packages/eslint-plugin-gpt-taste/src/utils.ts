import type { Rule } from "eslint";

/**
 * Extract string value from a JSX text node, literal, or template literal
 */
export function getStringValue(node: any): string | null {
  if (!node) return null;

  if (node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }

  if (node.type === "JSXText") {
    return node.value;
  }

  if (node.type === "JSXExpressionContainer" && node.expression) {
    return getStringValue(node.expression);
  }

  if (node.type === "TemplateLiteral" && node.quasis.length === 1) {
    return node.quasis[0].value.raw;
  }

  return null;
}

/**
 * Check if a JSX element has a specific tag name (handles MemberExpression too)
 */
export function getElementName(node: any): string | null {
  if (!node || node.type !== "JSXOpeningElement") return null;

  const name = node.name;
  if (name.type === "JSXIdentifier") {
    return name.name;
  }
  if (name.type === "JSXMemberExpression") {
    // Simple member expression flattening
    const parts: string[] = [];
    let current: any = name;
    while (current) {
      if (current.type === "JSXIdentifier") {
        parts.unshift(current.name);
        break;
      } else if (current.type === "JSXMemberExpression") {
        parts.unshift(current.property.name);
        current = current.object;
      } else {
        break;
      }
    }
    return parts.join(".");
  }
  return null;
}

/**
 * Extract className string from JSX attributes
 */
export function getClassNameValue(node: any): string | null {
  if (!node || node.type !== "JSXOpeningElement") return null;

  for (const attr of node.attributes) {
    if (
      attr.type === "JSXAttribute" &&
      attr.name &&
      attr.name.type === "JSXIdentifier" &&
      attr.name.name === "className"
    ) {
      return getStringValue(attr.value);
    }
  }
  return null;
}

/**
 * Check if className contains a specific Tailwind class
 */
export function hasClass(className: string | null, cls: string): boolean {
  if (!className) return false;
  const classes = className.split(/\s+/);
  return classes.includes(cls);
}

/**
 * Check if className contains any class matching a predicate
 */
export function hasClassMatching(
  className: string | null,
  predicate: (cls: string) => boolean
): boolean {
  if (!className) return false;
  return className.split(/\s+/).some(predicate);
}

/**
 * Create a standard rule object with typed context
 */
export function createRule(
  meta: Rule.RuleMetaData,
  create: (context: Rule.RuleContext) => Rule.RuleListener
): Rule.RuleModule {
  return {
    meta,
    create,
  };
}
