const typescript = require('@rollup/plugin-typescript');
const { terser } = require('rollup-plugin-terser');
const pkg = require('./package.json');

const version = process.env.SEMANTIC_RELEASE_NEXT_VERSION || pkg.version;
console.log(`Building Version: ${version}`);

const banner =
  '/*!\n' +
  ` * Signature Pad v${version} | ${pkg.homepage}\n` +
  ` * (c) ${new Date().getFullYear()} ${
    pkg.author.name
  } | Released under the MIT license\n` +
  ' */\n';

module.exports = [
  {
    // UMD unminified
    input: 'src/signature_pad.ts',
    plugins: [typescript({ target: 'ES2015' })],
    output: {
      // dir: 'dist',
      file: 'dist/signature_pad.umd.js',
      format: 'umd',
      name: 'SignaturePad',
      sourcemap: true,
      banner,
    },
  },
  {
    // UMD minified
    input: 'src/signature_pad.ts',
    plugins: [typescript({ target: 'ES2015' })],
    output: {
      // dir: 'dist',
      file: 'dist/signature_pad.umd.min.js',
      format: 'umd',
      name: 'SignaturePad',
      sourcemap: true,
      plugins: [terser()],
      banner,
    },
  },
  {
    // ES module unminified
    input: 'src/signature_pad.ts',
    plugins: [typescript({ target: 'ES2015' })],
    output: {
      // dir: 'dist',
      file: 'dist/signature_pad.js',
      format: 'es',
      sourcemap: true,
      banner,
    },
  },
  {
    // ES module minified
    input: 'src/signature_pad.ts',
    plugins: [typescript({ target: 'ES2015' })],
    output: {
      // dir: 'dist',
      file: 'dist/signature_pad.min.js',
      format: 'es',
      sourcemap: true,
      plugins: [terser()],
      banner,
    },
  },
];
