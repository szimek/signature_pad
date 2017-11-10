
const typescript = require('rollup-plugin-typescript');
const tslint = require('rollup-plugin-tslint');
const uglify = require('rollup-plugin-uglify');

const pkg = require('./package.json');

const plugins = (options = {}) => [
  tslint(),
  typescript({
    include: ['src/*.ts', 'src/*.js'],
    // Use the latest version of TypeScript
    typescript: require('typescript'),
    ...options,
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

module.exports = [{
  rollup: {
    input: 'src/signature_pad.ts',
    plugins: plugins({ target: 'ES3' }),
  },
  bundle: {
    file: 'dist/signature_pad.js',
    format: 'umd',
    name: 'SignaturePad',
    banner: longBanner,
  },
}, {
  rollup: {
    input: 'src/signature_pad.ts',
    plugins: [...plugins({ target: 'ES3' }), uglify()],
  },
  bundle: {
    file: 'dist/signature_pad.min.js',
    format: 'umd',
    name: 'SignaturePad',
    banner: shortBanner,
  },
}, {
  rollup: {
    input: 'src/signature_pad.ts',
    plugins: plugins({ target: 'ES6' }),
  },
  bundle: {
    file: 'dist/signature_pad.es.js',
    format: 'es',
    banner: longBanner,
  },
}];
