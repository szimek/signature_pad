const typescript = require('rollup-plugin-typescript2');
const { terser } = require('rollup-plugin-terser');
const pkg = require('./package.json');

const banner =
  '/*!\n' +
  ` * Signature Pad v${pkg.version} | ${pkg.homepage}\n` +
  ` * (c) ${new Date().getFullYear()} ${
    pkg.author.name
  } | Released under the MIT license\n` +
  ' */\n';

export default [
  {
    // UMD unminified
    input: 'src/index.ts',
    plugins: [typescript({
      target: 'ES3',
      useTsconfigDeclarationDir: true,
    })],
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
    // UMD unminified
    input: 'src/index.ts',
    plugins: [typescript({
      target: 'ES3',
      useTsconfigDeclarationDir: true,
    })],
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
    input: 'src/index.ts',
    plugins: [typescript({
      target: 'ES2015',
      useTsconfigDeclarationDir: true,
    })],
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
    input: 'src/index.ts',
    plugins: [typescript({
      target: 'ES2015',
      useTsconfigDeclarationDir: true,
    })],
    output: {
      // dir: 'dist',
      file: 'dist/signature_pad.min.js',
      format: 'es',
      sourcemap: true,
      plugins: [terser()],
      banner,
    },
  }
];
