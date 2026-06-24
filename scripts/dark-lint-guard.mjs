import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIRS = ['src'];
const BASELINE_FILE = 'docs/dark-mode/dark-lint-baseline.json';
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.mdx']);

const HEX = '#[0-9a-fA-F]{3,8}';
const SHADE = '(?:gray|zinc|neutral|slate)';
const TONE = '(?:50|100|200|300|400|500|600|700|800|900|950)';
const COLOR_PREFIX = '(?:bg|text|border|divide|ring|from|via|to|fill|stroke|outline|placeholder|caret|accent|decoration)';

const RULES = [
  { rule: 'background-white-black', pattern: /\bbg-(?:white|black)\b/g },
  { rule: 'neutral-color-utility', pattern: new RegExp(`\\b${COLOR_PREFIX}-${SHADE}-${TONE}(?:/[0-9]{1,3})?\\b`, 'g') },
  { rule: 'arbitrary-hex-color-utility', pattern: new RegExp(`\\b${COLOR_PREFIX}-\\[${HEX}\\](?:/[0-9]{1,3})?`, 'g') },
  { rule: 'inline-literal-color', pattern: new RegExp(`\\b(?:color|background|backgroundColor)\\s*:\\s*(['"\`])${HEX}\\1`, 'g') },
];

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

function hasExemption(lines, line) {
  return (lines[line - 2] || '').includes('dark-mode-exempt');
}

function signature(finding) {
  return [finding.file, finding.rule, finding.value, finding.lineText].join('::');
}

function addCount(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function scanSource(source, file) {
  const findings = [];
  const lines = source.split('\n');

  for (const { rule, pattern } of RULES) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      const position = lineAndColumn(source, match.index ?? 0);
      if (hasExemption(lines, position.line)) continue;

      findings.push({
        file,
        line: position.line,
        column: position.column,
        rule,
        value: match[0],
        lineText: (lines[position.line - 1] || '').trim(),
      });
    }
  }

  return findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column || a.rule.localeCompare(b.rule));
}

async function scan() {
  const files = [];
  for (const sourceDir of SOURCE_DIRS) {
    files.push(...(await walk(path.join(ROOT, sourceDir))));
  }

  const findings = [];
  for (const file of files) {
    const relativeFile = path.relative(ROOT, file);
    const source = await readFile(file, 'utf8');
    findings.push(...scanSource(source, relativeFile));
  }

  return findings;
}

async function readBaseline() {
  const baselinePath = path.join(ROOT, BASELINE_FILE);
  const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
  return baseline.findings || [];
}

async function writeBaseline(findings) {
  const baselinePath = path.join(ROOT, BASELINE_FILE);
  const output = {
    totalFindings: findings.length,
    filesAffected: new Set(findings.map((finding) => finding.file)).size,
    findings,
  };
  await mkdir(path.dirname(baselinePath), { recursive: true });
  await writeFile(baselinePath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Dark-mode guard baseline wrote ${BASELINE_FILE}`);
  console.log(`${output.totalFindings} baseline findings across ${output.filesAffected} files`);
}

function diffAgainstBaseline(current, baseline) {
  const baselineCounts = new Map();
  for (const finding of baseline) addCount(baselineCounts, signature(finding));

  const newFindings = [];
  for (const finding of current) {
    const key = signature(finding);
    const remaining = baselineCounts.get(key) || 0;
    if (remaining > 0) {
      baselineCounts.set(key, remaining - 1);
    } else {
      newFindings.push(finding);
    }
  }

  return newFindings;
}

const updateBaseline = process.argv.includes('--update-baseline');
const currentFindings = await scan();

if (updateBaseline) {
  await writeBaseline(currentFindings);
} else {
  const baselineFindings = await readBaseline();
  const newFindings = diffAgainstBaseline(currentFindings, baselineFindings);

  if (newFindings.length > 0) {
    console.error(`Dark-mode guard found ${newFindings.length} new hardcoded color finding(s):`);
    for (const finding of newFindings.slice(0, 40)) {
      console.error(`${finding.file}:${finding.line}:${finding.column} ${finding.rule} ${finding.value}`);
    }
    if (newFindings.length > 40) {
      console.error(`...and ${newFindings.length - 40} more`);
    }
    console.error('Use semantic tokens, or place a dark-mode-exempt comment directly above the intentional line.');
    process.exitCode = 1;
  } else {
    console.log('Dark-mode guard: no new hardcoded color findings.');
  }
}
