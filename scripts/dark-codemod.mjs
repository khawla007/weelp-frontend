import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const DEFAULT_PREVIEW_DIR = 'docs/dark-mode/codemod-preview';
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mdx']);

export const SWAP_TABLE = new Map([
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

  ['bg-zinc-50', 'bg-muted'],
  ['bg-zinc-100', 'bg-muted'],
  ['bg-zinc-200', 'bg-accent'],
  ['bg-zinc-300', 'bg-border'],
  ['bg-zinc-400', 'bg-muted-foreground'],
  ['bg-slate-50', 'bg-muted'],
  ['bg-neutral-50', 'bg-muted'],
  ['bg-neutral-100', 'bg-muted'],
  ['bg-gray-100', 'bg-muted'],
  ['bg-gray-800', 'bg-foreground'],
  ['text-zinc-400', 'text-muted-foreground'],
  ['text-zinc-500', 'text-muted-foreground'],
  ['text-zinc-600', 'text-copy'],
  ['text-zinc-700', 'text-copy'],
  ['text-zinc-800', 'text-foreground'],
  ['text-zinc-900', 'text-foreground'],
  ['text-zinc-300', 'text-muted-foreground'],
  ['text-slate-800', 'text-foreground'],
  ['text-neutral-500', 'text-muted-foreground'],
  ['text-neutral-600', 'text-copy'],
  ['text-neutral-700', 'text-copy'],
  ['text-neutral-800', 'text-foreground'],
  ['text-neutral-900', 'text-foreground'],
  ['text-gray-300', 'text-muted-foreground'],
  ['text-gray-900', 'text-foreground'],
  ['border-zinc-200', 'border-border'],
  ['border-zinc-300', 'border-border'],
  ['border-zinc-400', 'border-border'],
  ['border-neutral-200', 'border-border'],
  ['border-neutral-300', 'border-border'],
  ['border-gray-100', 'border-border'],

  ['text-[#71717A]', 'text-muted-foreground'],
  ['text-[#27272a]', 'text-foreground'],
  ['text-[#3f3f46]', 'text-foreground'],
  ['bg-[#eaeaea]', 'bg-muted'],
  ['border-[#eaeaea]', 'border-border'],
  ['border-[#f4f4f5]', 'border-border'],
  ['bg-[#f8faf9]', 'bg-weelp-sage-wash'],
  ['bg-[#F5F9FA]', 'bg-weelp-sage-wash'],
  ['bg-[#f5f9fa]', 'bg-weelp-sage-wash'],
  ['bg-[#b5d8cb]', 'bg-weelp-sage-tint'],
  ['bg-[#588f7a]', 'bg-weelp-sage-deep'],
  ['bg-[#568f7c]', 'bg-weelp-sage-deep'],
  ['bg-[#4d8069]', 'bg-weelp-sage-hover'],
  ['bg-[#4a7a6a]', 'bg-weelp-sage-hover'],
  ['bg-[#4a7a68]', 'bg-weelp-sage-hover'],
  ['bg-[#558e7b]', 'bg-weelp-sage-deep'],
  ['text-[#568f7c]', 'text-weelp-sage-deep'],
  ['text-[#588f7a]', 'text-weelp-sage-deep'],
  ['border-[#4d8069]', 'border-weelp-sage-hover'],
  ['bg-[#ff725e]', 'bg-weelp-discount'],
  ['text-[#ff725e]', 'text-weelp-discount'],
  ['bg-[#fef2f2]', 'bg-destructive/5'],
  ['text-[#b91c1c]', 'text-destructive'],
  ['border-[#fecaca]', 'border-destructive/40'],
  ['bg-[#f0fdf4]', 'bg-success/10'],
  ['text-[#166534]', 'text-success'],
  ['border-[#bbf7d0]', 'border-success/40'],
]);

const MANUAL_REVIEW_PATTERNS = [/\bhover:bg-\[#f2f7f5\]/gi, /\bbg-white\/\d{1,3}\b/g, /\bbg-black\/\d{1,3}\b/g, /\b(?:from|via|to)-\[#(?:[0-9a-fA-F]{3,8})\]/g];

function lineAndColumn(source, index) {
  const lines = source.slice(0, index).split('\n');

  return {
    line: lines.length,
    column: lines.at(-1).length + 1,
  };
}

function splitClasses(value) {
  return value.split(/(\s+)/);
}

function replaceClassList(value) {
  const replacements = [];
  const output = splitClasses(value)
    .map((part) => {
      if (/^\s+$/.test(part)) return part;

      const replacement = SWAP_TABLE.get(part.toLowerCase());
      if (!replacement || replacement === part) return part;

      replacements.push({ from: part, to: replacement });
      return replacement;
    })
    .join('');

  return { output, replacements };
}

function collectManualReview(source, file) {
  const skipped = [];

  for (const match of source.matchAll(/className=\{`[\s\S]*?\$\{[\s\S]*?`}/g)) {
    const position = lineAndColumn(source, match.index ?? 0);
    skipped.push({
      file,
      line: position.line,
      column: position.column,
      reason: 'dynamic className template literal',
      value: match[0].slice(0, 160),
    });
  }

  for (const pattern of MANUAL_REVIEW_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      const position = lineAndColumn(source, match.index ?? 0);
      skipped.push({
        file,
        line: position.line,
        column: position.column,
        reason: 'decision-required color case',
        value: match[0],
      });
    }
  }

  return skipped.sort((a, b) => a.line - b.line || a.column - b.column);
}

export function transformSource(source, file = '') {
  const replacements = [];
  let output = source;

  output = output.replace(/className=(["'])([^"']*?)\1/g, (full, quote, classList, offset) => {
    const result = replaceClassList(classList);
    for (const replacement of result.replacements) {
      replacements.push({ file, ...lineAndColumn(source, offset), ...replacement });
    }

    return `className=${quote}${result.output}${quote}`;
  });

  output = output.replace(/className=\{`([^`$]*)`\}/g, (full, classList, offset) => {
    const result = replaceClassList(classList);
    for (const replacement of result.replacements) {
      replacements.push({ file, ...lineAndColumn(source, offset), ...replacement });
    }

    return `className={\`${result.output}\`}`;
  });

  const skipped = collectManualReview(source, file);

  return {
    output,
    changed: output !== source,
    replacements,
    skipped,
  };
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

function globToRegExp(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\0')
    .replace(/\*/g, '[^/]*')
    .replace(/\0/g, '.*');

  return new RegExp(`^${escaped}$`);
}

async function expandInclude(root, include) {
  const normalizedInclude = include.replace(/\\/g, '/').replace(/^\.\//, '');
  const absolute = path.resolve(root, include);

  if (!/[?*[\]]/.test(include)) {
    try {
      const statFiles = await walk(absolute);
      return statFiles;
    } catch {
      return [absolute];
    }
  }

  const matcher = globToRegExp(normalizedInclude);
  const candidates = await walk(path.join(root, 'src'));
  return candidates.filter((candidate) => matcher.test(path.relative(root, candidate).replace(/\\/g, '/')));
}

export async function runCodemodOnFiles({ root = ROOT, files, apply = false, previewDir = path.join(root, DEFAULT_PREVIEW_DIR) }) {
  const report = {
    mode: apply ? 'apply' : 'dry-run',
    changedFiles: 0,
    replacements: [],
    skipped: [],
    files: [],
  };

  for (const file of files) {
    if (!EXTENSIONS.has(path.extname(file))) continue;

    const source = await readFile(file, 'utf8');
    const relativeFile = path.relative(root, file);
    const result = transformSource(source, relativeFile);

    report.replacements.push(...result.replacements);
    report.skipped.push(...result.skipped);

    if (!result.changed) continue;

    report.changedFiles += 1;
    report.files.push(relativeFile);

    if (apply) {
      await writeFile(file, result.output);
    } else {
      const previewFile = path.join(previewDir, relativeFile);
      await mkdir(path.dirname(previewFile), { recursive: true });
      await writeFile(previewFile, result.output);
    }
  }

  if (!apply) {
    await mkdir(previewDir, { recursive: true });
    await writeFile(path.join(previewDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  }

  return report;
}

function parseArgs(argv) {
  const args = {
    apply: false,
    dry: false,
    include: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--dry' || arg === '--dry-run') args.dry = true;
    else if (arg === '--include') {
      args.include = argv[index + 1] ?? '';
      index += 1;
    } else if (arg.startsWith('--include=')) {
      args.include = arg.slice('--include='.length);
    }
  }

  return args;
}

export async function runCodemodCli(argv = process.argv.slice(2), root = ROOT) {
  const args = parseArgs(argv);

  if (args.apply && args.dry) {
    throw new Error('Choose either --dry or --apply, not both.');
  }

  if (!args.apply && !args.dry) {
    args.dry = true;
  }

  if (!args.include) {
    throw new Error('Codemod requires an explicit --include path or glob.');
  }

  const files = await expandInclude(root, args.include);
  const report = await runCodemodOnFiles({
    root,
    files,
    apply: args.apply,
    previewDir: path.join(root, DEFAULT_PREVIEW_DIR),
  });

  console.log(`Dark codemod ${report.mode}: ${report.changedFiles} changed file(s)`);
  console.log(`${report.replacements.length} replacement(s), ${report.skipped.length} manual-review skip(s)`);
  if (!args.apply) {
    console.log(`Preview written to ${DEFAULT_PREVIEW_DIR}`);
  }

  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCodemodCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
