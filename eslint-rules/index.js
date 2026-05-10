/**
 * Weelp custom ESLint rules — Impeccable Cascade Phase 12 + 13 lint guards.
 *
 * Encodes five named rules from frontend/DESIGN.md:
 *   1. weelp/no-noncanonical-hex       — §2 canonical token allow-list (className)
 *   2. weelp/no-noncanonical-container — §7 Single-Container Rule + exceptions
 *   3. weelp/no-inline-heading-font    — §3 Global-Heading Rule
 *   4. weelp/no-inline-style-hex       — §2 canonical token allow-list (inline style)
 *   5. weelp/no-semantic-gray          — §5 Primitive Baseline (zinc canonical, gray/neutral drift)
 *
 * Zero-dependency: pure ESLint AST visitors over JSX. No tailwind plugin.
 */

const CANONICAL_HEXES = new Set([
  '18181b', // ink
  '71717a', // ink-soft
  '52525b', // ink-mid
  '588f7a', // sage (Single-Sage Rule)
  'e4e4e7', // border
  'f4f4f5', // surface-soft
  'f8faf9', // surface
  'ff725e', // accent (warning/orange)
  '435a67', // legacy ink-sage
  'b5d8cb', // sage tint
  'f2f7f5', // sage wash
  'ffffff',
  'fff',
]);

const CONTAINER_PATTERN = /\bmax-w-(4xl|5xl|6xl|7xl)\b/g;
const HEX_PATTERN = /\b(text|bg|border|fill|ring|from|to|via|stroke|outline|divide|placeholder|caret|accent|shadow|decoration)-\[#([0-9a-fA-F]{3,8})\]/g;

function normalizeHex(raw) {
  const lower = raw.toLowerCase();
  if (lower.length === 8) return lower.slice(0, 6); // strip alpha
  return lower;
}

function collectClassStrings(node) {
  if (!node) return [];
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return [{ value: node.value, node }];
  }
  if (node.type === 'TemplateLiteral') {
    return node.quasis.map((q) => ({ value: q.value.cooked || '', node: q }));
  }
  if (node.type === 'JSXExpressionContainer') {
    return collectClassStrings(node.expression);
  }
  if (node.type === 'ConditionalExpression') {
    return [...collectClassStrings(node.consequent), ...collectClassStrings(node.alternate)];
  }
  if (node.type === 'LogicalExpression') {
    return [...collectClassStrings(node.left), ...collectClassStrings(node.right)];
  }
  if (node.type === 'CallExpression') {
    return node.arguments.flatMap((arg) => collectClassStrings(arg));
  }
  if (node.type === 'ArrayExpression') {
    return node.elements.flatMap((el) => (el ? collectClassStrings(el) : []));
  }
  return [];
}

const noNoncanonicalHex = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow non-canonical hex colors in className strings' },
    schema: [
      {
        type: 'object',
        properties: { allowExtra: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
    messages: {
      drift: 'Non-canonical hex {{hex}} in `{{cls}}`. Use a token from DESIGN.md §2 (e.g. text-[#18181b], border-[#e4e4e7]).',
    },
  },
  create(context) {
    const opts = context.options[0] || {};
    const extra = new Set((opts.allowExtra || []).map((h) => h.toLowerCase()));
    return {
      JSXAttribute(attr) {
        if (!attr.name || attr.name.name !== 'className') return;
        const strings = collectClassStrings(attr.value);
        for (const { value, node } of strings) {
          let m;
          HEX_PATTERN.lastIndex = 0;
          while ((m = HEX_PATTERN.exec(value)) !== null) {
            const hex = normalizeHex(m[2]);
            if (CANONICAL_HEXES.has(hex) || extra.has(hex)) continue;
            context.report({
              node,
              messageId: 'drift',
              data: { hex: `#${m[2]}`, cls: m[0] },
            });
          }
        }
      },
    };
  },
};

const noNoncanonicalContainer = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow raw max-w-(4xl|5xl|6xl|7xl) outside .container-page utility' },
    schema: [
      {
        type: 'object',
        properties: { allow: { type: 'array', items: { enum: ['4xl', '5xl', '6xl', '7xl'] } } },
        additionalProperties: false,
      },
    ],
    messages: {
      drift: 'Use `.container-page` instead of `max-w-{{size}}` (DESIGN.md §7 Single-Container Rule). Reading-Column / Dashboard-Surface exceptions must be opted in via eslint override.',
    },
  },
  create(context) {
    const opts = context.options[0] || {};
    const allow = new Set(opts.allow || []);
    return {
      JSXAttribute(attr) {
        if (!attr.name || attr.name.name !== 'className') return;
        const strings = collectClassStrings(attr.value);
        for (const { value, node } of strings) {
          let m;
          CONTAINER_PATTERN.lastIndex = 0;
          while ((m = CONTAINER_PATTERN.exec(value)) !== null) {
            if (allow.has(m[1])) continue;
            context.report({ node, messageId: 'drift', data: { size: m[1] } });
          }
        }
      },
    };
  },
};

const noInlineHeadingFont = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow inline fontFamily on h1–h6 (Global-Heading Rule)' },
    schema: [],
    messages: {
      drift: 'Inline `style={{ fontFamily }}` on <{{tag}}> breaks the Global-Heading Rule (DESIGN.md §3). Remove the override; @layer base handles it.',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = node.name && node.name.name;
        if (!name || !/^h[1-6]$/.test(name)) return;
        const styleAttr = node.attributes.find((a) => a.type === 'JSXAttribute' && a.name && a.name.name === 'style');
        if (!styleAttr || !styleAttr.value) return;
        const expr = styleAttr.value.type === 'JSXExpressionContainer' ? styleAttr.value.expression : null;
        if (!expr || expr.type !== 'ObjectExpression') return;
        const hasFontFamily = expr.properties.some(
          (p) => p.type === 'Property' && ((p.key.type === 'Identifier' && p.key.name === 'fontFamily') || (p.key.type === 'Literal' && p.key.value === 'fontFamily')),
        );
        if (hasFontFamily) {
          context.report({ node, messageId: 'drift', data: { tag: name } });
        }
      },
    };
  },
};

const CSS_COLOR_PROPS = new Set([
  'color',
  'background',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'fill',
  'stroke',
  'outlineColor',
  'caretColor',
  'accentColor',
  'textDecorationColor',
  'columnRuleColor',
  'boxShadow',
]);

const INLINE_HEX_PATTERN = /#([0-9a-fA-F]{3,8})\b/g;

function propKeyName(prop) {
  if (!prop || prop.type !== 'Property') return null;
  if (prop.key.type === 'Identifier') return prop.key.name;
  if (prop.key.type === 'Literal' && typeof prop.key.value === 'string') return prop.key.value;
  return null;
}

function collectStringSegments(node) {
  if (!node) return [];
  if (node.type === 'Literal' && typeof node.value === 'string') return [{ value: node.value, node }];
  if (node.type === 'TemplateLiteral') return node.quasis.map((q) => ({ value: q.value.cooked || '', node: q }));
  if (node.type === 'ConditionalExpression') return [...collectStringSegments(node.consequent), ...collectStringSegments(node.alternate)];
  if (node.type === 'LogicalExpression') return [...collectStringSegments(node.left), ...collectStringSegments(node.right)];
  return [];
}

const noInlineStyleHex = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow non-canonical hex colors in JSX inline `style={{ … }}` props' },
    schema: [
      {
        type: 'object',
        properties: { allowExtra: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
    messages: {
      drift: 'Non-canonical hex {{hex}} in inline `style.{{prop}}`. Use a token from DESIGN.md §2 (e.g. `#18181b`, `#71717a`, `#588f7a`) or move the value to a className.',
    },
  },
  create(context) {
    const opts = context.options[0] || {};
    const extra = new Set((opts.allowExtra || []).map((h) => h.toLowerCase()));
    return {
      JSXAttribute(attr) {
        if (!attr.name || attr.name.name !== 'style') return;
        if (!attr.value || attr.value.type !== 'JSXExpressionContainer') return;
        const expr = attr.value.expression;
        if (!expr || expr.type !== 'ObjectExpression') return;
        for (const prop of expr.properties) {
          if (prop.type !== 'Property') continue;
          const key = propKeyName(prop);
          if (!key) continue;
          const looksColorish = CSS_COLOR_PROPS.has(key) || (key.startsWith('--') && /color|background|fill|stroke|shadow/i.test(key));
          if (!looksColorish) continue;
          for (const seg of collectStringSegments(prop.value)) {
            let m;
            INLINE_HEX_PATTERN.lastIndex = 0;
            while ((m = INLINE_HEX_PATTERN.exec(seg.value)) !== null) {
              const hex = normalizeHex(m[1]);
              if (CANONICAL_HEXES.has(hex) || extra.has(hex)) continue;
              context.report({
                node: seg.node,
                messageId: 'drift',
                data: { hex: `#${m[1]}`, prop: key },
              });
            }
          }
        }
      },
    };
  },
};

const SEMANTIC_GRAY_PATTERN = /\b(text|bg|border|ring|from|to|via|stroke|outline|divide|placeholder|caret|accent|shadow|decoration)-(gray|neutral)-[0-9]+\b/g;

const noSemanticGray = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Tailwind `gray-*` / `neutral-*` palette outside grandfathered shadcn primitives — canonical neutral is `zinc-*` (DESIGN.md §5).',
    },
    schema: [],
    messages: {
      drift:
        '`{{cls}}` uses non-canonical neutral palette. Replace with `zinc-*` (DESIGN.md §5 — primitives in `src/components/ui` are grandfathered via eslint override).',
    },
  },
  create(context) {
    return {
      JSXAttribute(attr) {
        if (!attr.name || attr.name.name !== 'className') return;
        const strings = collectClassStrings(attr.value);
        for (const { value, node } of strings) {
          let m;
          SEMANTIC_GRAY_PATTERN.lastIndex = 0;
          while ((m = SEMANTIC_GRAY_PATTERN.exec(value)) !== null) {
            context.report({ node, messageId: 'drift', data: { cls: m[0] } });
          }
        }
      },
    };
  },
};

export default {
  rules: {
    'no-noncanonical-hex': noNoncanonicalHex,
    'no-noncanonical-container': noNoncanonicalContainer,
    'no-inline-heading-font': noInlineHeadingFont,
    'no-inline-style-hex': noInlineStyleHex,
    'no-semantic-gray': noSemanticGray,
  },
};
