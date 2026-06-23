import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIRS = ['src/app', 'src/components'];
const OUTPUT_FILE = 'docs/dark-mode/audit.json';
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.mdx']);

const RULES = [
  { name: 'literal-bg', pattern: /\bbg-\[#(?:[0-9a-fA-F]{3,8})\]/g, suggestion: 'Replace with bg-background, bg-card, bg-muted, or a weelp token.' },
  { name: 'literal-text', pattern: /\btext-\[#(?:[0-9a-fA-F]{3,8})\]/g, suggestion: 'Replace with text-foreground, text-copy, text-muted-foreground, or a weelp token.' },
  { name: 'literal-border', pattern: /\bborder-\[#(?:[0-9a-fA-F]{3,8})\]/g, suggestion: 'Replace with border-border or a state/brand token.' },
  { name: 'white-black-bg', pattern: /\bbg-(?:white|black)\b/g, suggestion: 'Replace with bg-background, bg-card, bg-popover, or bg-foreground based on role.' },
  { name: 'gray-scale-bg', pattern: /\bbg-(?:gray|zinc|neutral|slate)-\d{2,3}\b/g, suggestion: 'Replace with bg-muted, bg-accent, bg-card, or bg-background.' },
  { name: 'gray-scale-text', pattern: /\btext-(?:gray|zinc|neutral|slate)-\d{2,3}\b/g, suggestion: 'Replace with text-muted-foreground, text-copy, or text-foreground.' },
  { name: 'gray-scale-border', pattern: /\bborder-(?:gray|zinc|neutral|slate)-\d{2,3}\b/g, suggestion: 'Replace with border-border.' },
  { name: 'shadow', pattern: /\bshadow(?:-\[[^\]]+\]|-[a-z0-9]+)?\b/g, suggestion: 'Keep only if appropriate; add dark:shadow-none or use Card primitive.' },
  {
    name: 'inline-literal-color',
    pattern: /style=\{\{[^}]*?(?:color|background|backgroundColor)\s*:\s*['"`]#[0-9a-fA-F]{3,8}['"`][^}]*?\}\}/g,
    suggestion: 'Move the literal color to a CSS variable or semantic utility class.',
  },
  { name: 'svg-literal-color', pattern: /\b(?:fill|stroke)=["']#[0-9a-fA-F]{3,8}["']/g, suggestion: 'Use currentColor plus text-* utilities unless the asset is intentionally fixed-brand.' },
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;

    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolute)));
      continue;
    }

    if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }

  return files;
}

function lineAndColumn(source, index) {
  const before = source.slice(0, index);
  const lines = before.split('\n');

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

const files = [];
for (const sourceDir of SOURCE_DIRS) {
  files.push(...(await walk(path.join(ROOT, sourceDir))));
}

const findings = [];
for (const file of files) {
  const source = await readFile(file, 'utf8');
  const matches = [];
  const ranges = ignoredRanges(source);

  for (const rule of RULES) {
    for (const match of source.matchAll(rule.pattern)) {
      if (isIgnoredIndex(match.index ?? 0, ranges)) continue;

      const position = lineAndColumn(source, match.index ?? 0);
      const lineText = source.split('\n')[position.line - 1] ?? '';
      if (lineText.includes('dark-audit-ignore')) continue;

      matches.push({
        rule: rule.name,
        value: match[0],
        line: position.line,
        column: position.column,
        suggestion: rule.suggestion,
      });
    }
  }

  if (matches.length > 0) {
    findings.push({
      file: path.relative(ROOT, file),
      findings: matches.sort((a, b) => a.line - b.line || a.column - b.column),
    });
  }
}

const outputPath = path.join(ROOT, OUTPUT_FILE);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), findings }, null, 2)}\n`);

const total = findings.reduce((sum, item) => sum + item.findings.length, 0);
console.log(`Dark-mode audit wrote ${OUTPUT_FILE}`);
console.log(`${total} findings across ${findings.length} files`);
