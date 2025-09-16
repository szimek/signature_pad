import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

function listTsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTsFiles(full));
    } else if (entry.isFile() && full.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

function isRelative(specifier: string): boolean {
  return specifier.startsWith('./') || specifier.startsWith('../');
}

describe('ESM relative import paths in src use .js extension', () => {
  const srcDir = path.join(__dirname, '..', 'src');
  const files = listTsFiles(srcDir);

  it('all relative import/export specifiers end with .js', () => {
    const violations: { file: string; specifier: string; kind: string; line: number; column: number }[] = [];

    for (const file of files) {
      const code = fs.readFileSync(file, 'utf8');
      const source = ts.createSourceFile(file, code, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);

      const checkSpecifier = (specifier: ts.Expression | undefined, kind: string) => {
        if (!specifier || !ts.isStringLiteralLike(specifier)) return;
        const text = specifier.text;
        if (isRelative(text) && !text.endsWith('.js')) {
          const start = specifier.getStart(source);
          const { line, character } = source.getLineAndCharacterOfPosition(start);
          violations.push({ file, specifier: text, kind, line: line + 1, column: character + 1 });
        }
      };

      const visit = (node: ts.Node) => {
        if (ts.isImportDeclaration(node)) {
          checkSpecifier(node.moduleSpecifier, 'import');
        } else if (ts.isExportDeclaration(node)) {
          checkSpecifier(node.moduleSpecifier, 'export');
        }
        ts.forEachChild(node, visit);
      };

      visit(source);
    }

    if (violations.length) {
      const msg = violations
        .map(v => `${path.relative(process.cwd(), v.file)}:${v.line}:${v.column} -> ${v.kind} '${v.specifier}' should end with .js`)
        .join('\n');
      const err = new Error(`Found relative import/export specifiers without .js extension:\n${msg}`) as Error & { stack?: string };
      // Suppress stack trace for this test to keep output focused on the actionable message.
      // The stack trace is not relevant here as it points to this test file, not the source files.
      // Jest will still show the failing test name, but not the noisy stack of the test file itself.
      err.stack = `Error: ${err.message}`;
      throw err;
    }
  });
});
