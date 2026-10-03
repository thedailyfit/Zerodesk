import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

it('keeps untrusted runtime values out of application stdout logs', () => {
  const violations: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(file); continue; }
      if (!file.endsWith('.ts') || file.endsWith('.spec.ts')) continue;
      const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
            /^(log|warn|error|debug|verbose|fatal)$/.test(node.expression.name.text) &&
            /^(this\.logger|console|Logger)$/.test(node.expression.expression.getText(source)) &&
            node.arguments.some(arg => !ts.isStringLiteral(arg) && !ts.isNoSubstitutionTemplateLiteral(arg))) {
          violations.push(path.relative(path.resolve(__dirname, '..'), file));
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
  };
  walk(path.resolve(__dirname, '..'));
  expect(violations).toEqual([]);
});
