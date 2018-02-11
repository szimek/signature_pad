
const typescript = require('rollup-plugin-typescript2');
const tslint = require('rollup-plugin-tslint');
const uglify = require('rollup-plugin-uglify');

const pkg = require('./package.json');

const plugins = (options = {}) => [
  tslint(),
  typescript({
    tsconfigDefaults: {},
    tsconfig: 'tsconfig.json',
    cacheRoot: './tmp/.rts2_cache',
    useTsconfigDeclarationDir: true,
    typescript: require('typescript'),
 		tsconfigOverride: {
       compilerOptions: options,
     },
  }),
];

const longBanner = '/*!\n' +
  ` * Signature Pad v${pkg.version}\n` +
  ` * ${pkg.homepage}\n` +
  ' *\n' +
  ` * Copyright ${new Date().getFullYear()} ${pkg.author.name}\n` +
  ' * Released under the MIT license\n' +
  ' *\n' +
  ' * The main idea and some parts of the code (e.g. drawing variable width Bézier curve) are taken from:\n' +
  ' * http://corner.squareup.com/2012/07/smoother-signatures.html\n' +
  ' *\n' +
  ' * Implementation of interpolation using cubic Bézier curves is taken from:\n' +
  ' * http://benknowscode.wordpress.com/2012/09/14/path-interpolation-using-cubic-bezier-and-control-point-estimation-in-javascript\n' +
  ' *\n' +
  ' * Algorithm for approximated length of a Bézier curve is taken from:\n' +
  ' * http://www.lemoda.net/maths/bezier-length/index.html\n' +
  ' *\n' +
  ' */\n';

const shortBanner = '/*!\n' +
  ` * Signature Pad v${pkg.version} | ${pkg.homepage}\n` +
  ` * (c) ${new Date().getFullYear()} ${pkg.author.name} | Released under the MIT license\n` +
  ' */\n';

export default [{
  input: 'src/signature_pad.ts',
  plugins: plugins({
    target: 'ES3',
}),
  output: {
    file: 'dist/signature_pad.umd.js',
    format: 'umd',
    name: 'SignaturePad',
    banner: longBanner,
  },
}, {
  input: 'src/signature_pad.ts',
  plugins: [
    ...plugins({
      target: 'ES3',
    }),
    uglify()
  ],
  output: {
    file: 'dist/signature_pad.umd.min.js',
    format: 'umd',
    name: 'SignaturePad',
    banner: shortBanner,
  },
}, {
  input: 'src/signature_pad.ts',
  plugins: plugins({
    target: 'ES5',
    declaration: true,
  }),
  output: {
    file: 'dist/signature_pad.es.js',
    format: 'es',
    banner: longBanner,
  },
}];
