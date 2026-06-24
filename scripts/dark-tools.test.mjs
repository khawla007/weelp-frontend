import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { auditSource } from './dark-audit.mjs';
import { runCodemodOnFiles, transformSource } from './dark-codemod.mjs';

test('auditSource reports planned dark-mode patterns with positions and token hints', () => {
  const source = [
    '<div className="bg-white text-[#18181b] border-gray-200 shadow-lg">',
    '  <svg fill="#fff" stroke="#123347" />',
    "  <span style={{ color: '#52525b', backgroundColor: '#f8f9f9' }}>Copy</span>",
    '</div>',
  ].join('\n');

  const findings = auditSource(source);

  assert.deepEqual(
    findings.map((finding) => [finding.rule, finding.value]),
    [
      ['background-white-black', 'bg-white'],
      ['text-hex', 'text-[#18181b]'],
      ['border-neutral-utility', 'border-gray-200'],
      ['svg-literal-fill', 'fill="#fff"'],
      ['svg-literal-stroke', 'stroke="#123347"'],
      ['inline-literal-color', "color: '#52525b'"],
      ['inline-literal-background', "backgroundColor: '#f8f9f9'"],
    ],
  );
  assert.equal(findings[0].line, 1);
  assert.equal(findings[0].column, 17);
  assert.equal(findings[1].suggestedToken, 'text-foreground');
});

test('transformSource swaps canonical static classes and reports dynamic templates', () => {
  const source = [
    'export function Demo({ tone }) {',
    '  return (',
    '    <>',
    '      <div className="bg-white text-[#52525b] border-[#e4e4e7] shadow-md" />',
    '      <div className={`bg-white ${tone}`} />',
    '    </>',
    '  );',
    '}',
  ].join('\n');

  const result = transformSource(source, 'src/Demo.jsx');

  assert.match(result.output, /className="bg-background text-copy border-border shadow-md"/);
  assert.equal(result.changed, true);
  assert.match(result.output, /className=\{`bg-background \$\{tone\}`\}/);
  assert.equal(result.replacements.length, 4);
  assert.equal(result.skipped.length, 1);
  assert.equal(transformSource(result.output, 'src/Demo.jsx').changed, false);
});

test('dry-run writes preview files without mutating source', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'dark-codemod-'));

  try {
    const sourceFile = path.join(root, 'src', 'Demo.jsx');
    const original = 'export const Demo = () => <div className="bg-white text-black" />;\n';
    await mkdir(path.dirname(sourceFile), { recursive: true });
    await writeFile(sourceFile, original);

    const report = await runCodemodOnFiles({
      root,
      files: [sourceFile],
      apply: false,
      previewDir: path.join(root, 'docs/dark-mode/codemod-preview'),
    });

    assert.equal(await readFile(sourceFile, 'utf8'), original);
    assert.equal(report.changedFiles, 1);

    const preview = await readFile(path.join(root, 'docs/dark-mode/codemod-preview/src/Demo.jsx'), 'utf8');
    assert.match(preview, /bg-background text-foreground/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
