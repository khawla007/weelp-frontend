import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const SOURCE_DIRS = ['src'];
const OUTPUT_FILE = 'docs/dark-mode/audit.json';
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.mdx', '.svg']);

const HEX = '#(?:[0-9a-fA-F]{3,8})';
const SHADE = '(?:gray|zinc|neutral|slate)';
const TONE = '(?:50|100|200|300|400|500|600|700|800|900|950)';

const TOKEN_HINTS = new Map([
  ['bg-white', 'bg-background'],
  ['bg-[#fff]', 'bg-background'],
  ['bg-[#ffffff]', 'bg-background'],
  ['bg-black', 'bg-foreground'],
  ['bg-[#000]', 'bg-foreground'],
  ['bg-[#000000]', 'bg-foreground'],
  ['bg-[#18181b]', 'bg-foreground'],
  ['bg-[#f8f9f9]', 'bg-background'],
  ['bg-mainBackground', 'bg-background'],
  ['bg-[#f4f4f5]', 'bg-muted'],
  ['bg-gray-50', 'bg-muted'],
  ['bg-zinc-100', 'bg-muted'],
  ['bg-[#f2f7f5]', 'bg-weelp-sage-wash'],
  ['bg-weelp-sage-wash', 'bg-weelp-sage-wash'],
  ['bg-[#fff4d8]', 'bg-warning/15'],
  ['bg-[#fff9f9]', 'bg-destructive/5'],
  ['bg-dangerLite', 'bg-destructive/5'],
  ['text-black', 'text-foreground'],
  ['text-[#000]', 'text-foreground'],
  ['text-[#000000]', 'text-foreground'],
  ['text-[#18181b]', 'text-foreground'],
  ['text-[#52525b]', 'text-copy'],
  ['text-gray-600', 'text-copy'],
  ['text-gray-700', 'text-copy'],
  ['text-[#71717a]', 'text-muted-foreground'],
  ['text-gray-500', 'text-muted-foreground'],
  ['text-[#435a67]', 'text-weelp-steel'],
  ['border-[#e4e4e7]', 'border-border'],
  ['border-gray-200', 'border-border'],
  ['border-[#f0c76d]', 'border-warning/40'],
  ['divide-gray-200', 'divide-border'],
]);

const RULES = [
  { rule: 'background-white-black', pattern: /\bbg-(?:white|black)\b/g, suggest: suggestClass },
  { rule: 'background-hex', pattern: new RegExp(`\\bbg-\\[${HEX}\\](?:/[0-9]{1,3})?`, 'g'), suggest: suggestClass },
  { rule: 'background-neutral-utility', pattern: new RegExp(`\\bbg-${SHADE}-${TONE}(?:/[0-9]{1,3})?\\b`, 'g'), suggest: suggestClass },
  { rule: 'background-legacy-token', pattern: /\bbg-(?:mainBackground|dangerLite)\b/g, suggest: suggestClass },
  { rule: 'text-hex', pattern: new RegExp(`\\btext-\\[${HEX}\\](?:/[0-9]{1,3})?`, 'g'), suggest: suggestClass },
  { rule: 'text-neutral-utility', pattern: new RegExp(`\\btext-${SHADE}-${TONE}(?:/[0-9]{1,3})?\\b`, 'g'), suggest: suggestClass },
  { rule: 'text-black', pattern: /\btext-black\b/g, suggest: suggestClass },
  { rule: 'border-hex', pattern: new RegExp(`\\bborder-\\[${HEX}\\](?:/[0-9]{1,3})?`, 'g'), suggest: suggestClass },
  { rule: 'border-neutral-utility', pattern: new RegExp(`\\bborder-${SHADE}-${TONE}(?:/[0-9]{1,3})?\\b`, 'g'), suggest: suggestClass },
  { rule: 'divide-neutral-utility', pattern: new RegExp(`\\bdivide-${SHADE}-${TONE}(?:/[0-9]{1,3})?\\b`, 'g'), suggest: suggestClass },
  {
    rule: 'inline-literal-color',
    pattern: new RegExp(`\\bcolor\\s*:\\s*(['"\`])${HEX}\\1`, 'g'),
    suggest: (value) => suggestInline(value, 'color'),
  },
  {
    rule: 'inline-literal-background',
    pattern: new RegExp(`\\bbackground(?:Color)?\\s*:\\s*(['"\`])${HEX}\\1`, 'g'),
    suggest: (value) => suggestInline(value, 'background'),
  },
  {
    rule: 'svg-literal-fill',
    pattern: new RegExp(`\\bfill=["']${HEX}["']`, 'g'),
    suggest: () => 'currentColor or a semantic text-* utility',
  },
  {
    rule: 'svg-literal-stroke',
    pattern: new RegExp(`\\bstroke=["']${HEX}["']`, 'g'),
    suggest: () => 'currentColor or a semantic text-* utility',
  },
];

function normalizeClass(value) {
  return value.toLowerCase();
}

function suggestClass(value) {
  const normalized = normalizeClass(value.replace(/\/[0-9]{1,3}$/, ''));
  if (TOKEN_HINTS.has(normalized)) return TOKEN_HINTS.get(normalized);

  if (/^bg-(gray|zinc|neutral|slate)-(50|100)$/.test(normalized)) return 'bg-muted';
  if (/^bg-(gray|zinc|neutral|slate)-/.test(normalized)) return 'bg-muted or bg-accent';
  if (/^text-(gray|zinc|neutral|slate)-(500|600|700)$/.test(normalized)) return 'text-muted-foreground or text-copy';
  if (/^text-(gray|zinc|neutral|slate)-/.test(normalized)) return 'text-muted-foreground';
  if (/^border-(gray|zinc|neutral|slate)-/.test(normalized)) return 'border-border';
  if (/^divide-(gray|zinc|neutral|slate)-/.test(normalized)) return 'divide-border';

  return 'manual review';
}

function suggestInline(value, property) {
  const hex = value.match(/#[0-9a-fA-F]{3,8}/)?.[0]?.toLowerCase();
  if (!hex) return 'manual review';

  const classPrefix = property === 'color' ? 'text' : 'bg';
  return suggestClass(`${classPrefix}-[${hex}]`);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;

    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolute)));
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }

  return files;
}

function lineAndColumn(source, index) {
  const lines = source.slice(0, index).split('\n');

  return {
    line: lines.length,
    column: lines.at(-1).length + 1,
  };
}

function ignoredRanges(source) {
  const ranges = [];
  const bridgeStart = source.indexOf('Temporary dark-mode bridge');
  if (bridgeStart >= 0) {
    const bridgeEnd = source.indexOf('/* Additional custmization */', bridgeStart);
    ranges.push([bridgeStart, bridgeEnd >= 0 ? bridgeEnd : source.length]);
  }

  return ranges;
}

function isIgnoredIndex(index, ranges) {
  return ranges.some(([start, end]) => index >= start && index < end);
}

export function auditSource(source, file = '') {
  const findings = [];
  const ranges = ignoredRanges(source);
  const lines = source.split('\n');

  for (const { rule, pattern, suggest } of RULES) {
    pattern.lastIndex = 0;

    for (const match of source.matchAll(pattern)) {
      const index = match.index ?? 0;
      if (isIgnoredIndex(index, ranges)) continue;

      const position = lineAndColumn(source, index);
      const lineText = lines[position.line - 1] ?? '';
      if (lineText.includes('dark-audit-ignore')) continue;
      if ((lines[position.line - 2] ?? '').includes('dark-mode-exempt')) continue;

      findings.push({
        file,
        line: position.line,
        column: position.column,
        rule,
        value: match[0],
        matchedValue: match[0],
        suggestedToken: suggest(match[0]),
      });
    }
  }

  return findings.sort((a, b) => a.line - b.line || a.column - b.column || a.rule.localeCompare(b.rule));
}

export async function runAudit({ root = ROOT, sourceDirs = SOURCE_DIRS, outputFile = OUTPUT_FILE } = {}) {
  const files = [];
  for (const sourceDir of sourceDirs) {
    files.push(...(await walk(path.join(root, sourceDir))));
  }

  const findings = [];
  for (const file of files) {
    const relativeFile = path.relative(root, file);
    const source = await readFile(file, 'utf8');
    findings.push(...auditSource(source, relativeFile));
  }

  const filesAffected = new Set(findings.map((finding) => finding.file)).size;
  const output = {
    generatedAt: new Date().toISOString(),
    totalFindings: findings.length,
    filesAffected,
    findings,
  };
  const outputPath = path.join(root, outputFile);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);

  return output;
}

async function main() {
  const output = await runAudit();
  console.log(`Dark-mode audit wrote ${OUTPUT_FILE}`);
  console.log(`${output.totalFindings} findings across ${output.filesAffected} files`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
