import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

/**
 * Local ESLint plugin with a rule to enforce .js extension in relative import/export specifiers.
 * @type {import('eslint').ESLint.Plugin}
 */
const localPlugin = {
  rules: {
    'require-js-extension-in-relative-specifiers': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require .js extension in relative import/export specifiers',
          recommended: false,
        },
        schema: [],
        messages: {
          requireJsExt: "Relative {{kind}} '{{name}}' must include .js extension for ESM compatibility.",
        },
      },
      create (context) {
        function check (node, source, kind) {
          if (!source || source.type !== 'Literal') return;
          const name = String(source.value || '');
          if ((name.startsWith('./') || name.startsWith('../')) && !name.endsWith('.js')) {
            context.report({ node: source, messageId: 'requireJsExt', data: { kind, name } });
          }
        }

        return {
          ImportDeclaration (node) {
            check(node, node.source, 'import');
          },
          ExportNamedDeclaration (node) {
            check(node, node.source, 'export');
          },
          ExportAllDeclaration (node) {
            check(node, node.source, 'export');
          },
        };
      },
    },
  },
};

export default [
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: [
      'coverage',
      'dist',
      'node_modules',
      '.vscode',
      'rollup.config.js',
    ]
  },
  // Enforce .js extensions in relative imports/exports within src (ESM-friendly)
  {
    files: ['src/**/*.ts'],
    rules: {
      // Use a local custom rule to avoid brittle esquery regex
      'local/require-js-extension-in-relative-specifiers': 'error',
    },
    plugins: {
      local: localPlugin,
    },
  },
];
