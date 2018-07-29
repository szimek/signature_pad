const typescript = require('rollup-plugin-typescript2');
const tslint = require('rollup-plugin-tslint');
const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');

const plugins = (tsConfig = {}) => [
  tslint(),
  typescript({
    tsconfig: 'tsconfig.json',
    tsconfigOverride: tsConfig,
    typescript: require('typescript'),
    cacheRoot: './tmp/.rts2_cache',
    useTsconfigDeclarationDir: true,
    include: ["src/**/*.ts"],
  }),
];

const banner = '/*!\n' +
  ` * Signature Pad v${pkg.version} | ${pkg.homepage}\n` +
  ` * (c) ${new Date().getFullYear()} ${pkg.author.name} | Released under the MIT license\n` +
  ' */\n';

export default [
  // CJS unminified
  {
    input: 'src/signature_pad.ts',
    plugins: [
      ...plugins({
        compilerOptions: {
          target: 'ES3',
        },
      })
    ],
    output: {
      file: 'dist/signature_pad.js',
      format: 'cjs',
      banner,
    },
  },

  // CJS minified
  {
    input: 'src/signature_pad.ts',
    plugins: [
      ...plugins({
        compilerOptions: {
          target: 'ES3',
        },
      }),
      terser()
    ],
    output: {
      file: 'dist/signature_pad.min.js',
      format: 'cjs',
      banner,
    },
  },

  // UMD unminified
  {
    input: 'src/signature_pad.ts',
    plugins: [
      ...plugins({
        compilerOptions: {
          target: 'ES3',
        },
      }),
    ],
    output: {
      file: 'dist/signature_pad.umd.js',
      format: 'umd',
      name: 'SignaturePad',
      banner,
    },
  },

  // UMD minified
  {
    input: 'src/signature_pad.ts',
    plugins: [
      ...plugins({
        compilerOptions: {
          target: 'ES3',
        },
      }),
      terser()
    ],
    output: {
      file: 'dist/signature_pad.umd.min.js',
      format: 'umd',
      name: 'SignaturePad',
      banner,
    },
  },

  // ES module unminified
  {
    input: 'src/signature_pad.ts',
    plugins: [
      ...plugins({
        compilerOptions: {
          target: 'ES6',
          declaration: true,
        },
      }),
    ],
    output: {
      file: 'dist/signature_pad.m.js',
      format: 'es',
      banner,
    },
  },

  // ES module minified
  {
    input: 'src/signature_pad.ts',
    plugins: [
      ...plugins({
        compilerOptions: {
          target: 'ES6',
        },
      }),
      terser(),
    ],
    output: {
      file: 'dist/signature_pad.m.min.js',
      format: 'es',
      banner,
    },
  },
];
